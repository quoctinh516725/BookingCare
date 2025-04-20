import React, { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import PropTypes from "prop-types";
import PaymentService from "../../../services/PaymentService";
import logo from "../../assets/logo.png";
import { formatCurrency } from "../../utils/formatters";
import { Spin, Result, Button } from 'antd';
import { QrcodeOutlined, LoadingOutlined, ReloadOutlined } from '@ant-design/icons';
import styled from 'styled-components';

// Tạo mã xác thực ngẫu nhiên (sẽ không hiển thị ở profile)
const generateVerificationCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Bỏ qua các ký tự dễ nhầm lẫn như 0, O, 1, I
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const QRCodeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #eaeaea;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  background-color: white;
  min-height: 300px;
  width: 100%;
  max-width: 320px;
  margin: 0 auto;
`;

const QRImage = styled.img`
  width: 220px;
  height: 220px;
  margin-bottom: 15px;
`;

const PaymentInstructions = styled.div`
  margin-top: 15px;
  text-align: center;
  color: #555;
  font-size: 14px;
`;

const QRPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 220px;
  height: 220px;
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  color: #999;
  margin-bottom: 15px;
`;

const PaymentQRCode = ({ bookingId, isProfilePage = true }) => {
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [showLargeQR, setShowLargeQR] = useState(false);

  const fetchPaymentDetails = async () => {
    if (!bookingId) return;

    setLoading(true);
    setError(false);
    setNotFound(false);

    try {
      const response = await PaymentService.getPaymentByBookingId(bookingId);
      if (response.success && response.data) {
        setPayment(response.data);

        // Quản lý mã xác thực
        let verificationCodeToUse = "";

        // Kiểm tra trạng thái thanh toán
        if (response.data.status === "UNPAID") {
          // Thử lấy mã từ QR data trước
          if (response.data.qrData) {
            try {
              const qrData = JSON.parse(response.data.qrData);
              if (qrData.maXacThuc) {
                verificationCodeToUse = qrData.maXacThuc;
              }
            } catch (error) {
              console.error("Lỗi khi xử lý dữ liệu QR:", error);
            }
          }

          // Nếu không có mã trong QR data, kiểm tra localStorage
          if (!verificationCodeToUse) {
            const savedCode = localStorage.getItem(`payment_code_${bookingId}`);
            if (savedCode) {
              verificationCodeToUse = savedCode;
            } else {
              // Tạo mã mới nếu không tìm thấy
              verificationCodeToUse = generateVerificationCode();
              localStorage.setItem(
                `payment_code_${bookingId}`,
                verificationCodeToUse
              );
            }
          }
        } else {
          // Nếu đã thanh toán, thử lấy mã từ QR data
          try {
            if (response.data.qrData) {
              const qrData = JSON.parse(response.data.qrData);
              if (qrData.maXacThuc) {
                verificationCodeToUse = qrData.maXacThuc;
              }
            }
          } catch (error) {
            console.error("Lỗi khi xử lý dữ liệu QR:", error);
            // Nếu có lỗi, lấy từ localStorage
            const savedCode = localStorage.getItem(`payment_code_${bookingId}`);
            if (savedCode) {
              verificationCodeToUse = savedCode;
            }
          }
        }

        // Cập nhật state với mã xác thực
        setVerificationCode(verificationCodeToUse);
      } else {
        if (response.status === 404) {
          setNotFound(true);
        } else {
          setError(response.message || "Không thể tải thông tin thanh toán");
        }
      }
    } catch (error) {
      console.error("Lỗi khi tải thông tin thanh toán:", error);
      if (error.response?.status === 404) {
        setNotFound(true);
      } else {
        setError("Đã xảy ra lỗi khi tải thông tin thanh toán");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentDetails();
  }, [bookingId]);

  // Tạo dữ liệu QR với thông tin chi tiết bằng tiếng Việt
  const getQRData = () => {
    if (!payment) return "";

    // Đảm bảo có mã xác thực hợp lệ
    const currentCode =
      verificationCode ||
      localStorage.getItem(`payment_code_${bookingId}`) ||
      generateVerificationCode();

    // Nếu không có mã trong state, cập nhật state và lưu vào localStorage
    if (!verificationCode) {
      setVerificationCode(currentCode);
      localStorage.setItem(`payment_code_${bookingId}`, currentCode);
    }

    try {
      // Tạo dữ liệu QR dạng text
      let textData = `BEAUTYCARE PAYMENT\n`;
      textData += `MA THANH TOAN: ${payment.paymentCode}\n`;
      textData += `MA XAC THUC: ${currentCode}\n`;
      textData += `TONG TIEN: ${formatCurrency(payment.amount)}\n`;
      textData += `TRANG THAI: ${
        payment.status === "COMPLETED" ? "DA THANH TOAN" : "CHUA THANH TOAN"
      }\n\n`;

      return textData;
    } catch (error) {
      console.error("Lỗi khi tạo dữ liệu QR:", error);
      return `BEAUTYCARE PAYMENT\nMA THANH TOAN: ${payment.paymentCode}\nMA XAC THUC: ${currentCode}\nMA DAT LICH: ${payment.bookingId}`;
    }
  };

  const handleImageError = () => {
    setError(true);
  };

  const renderQRContent = () => {
    if (loading) {
      return (
        <QRPlaceholder>
          <LoadingOutlined style={{ fontSize: 48, marginBottom: 10 }} />
          <span>Đang tải mã QR...</span>
        </QRPlaceholder>
      );
    }

    if (error || !payment) {
      return (
        <Result
          status="warning"
          title="Không thể tải mã QR"
          subTitle="Vui lòng thử lại sau"
          extra={
            <Button 
              type="primary" 
              icon={<ReloadOutlined />} 
              onClick={fetchPaymentDetails}
            >
              Thử lại
            </Button>
          }
        />
      );
    }

    return (
      <>
        <QRImage 
          src={getQRData()} 
          alt="Mã QR thanh toán" 
          onError={handleImageError} 
        />
        {payment.amount && (
          <div>
            <strong>Số tiền:</strong> {formatCurrency(payment.amount)}
          </div>
        )}
      </>
    );
  };

  // Modal hiển thị QR lớn
  const QRModal = () => (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 bg-opacity-50"
      onClick={() => setShowLargeQR(false)}
    >
      <div
        className="bg-white p-6 rounded-lg max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <img src={logo} alt="BeautyCare" className="h-8 mr-2" />
            <h3 className="text-xl font-bold">BeautyCare</h3>
          </div>
          <span
            onClick={() => setShowLargeQR(false)}
            className="text-gray-500 cursor-pointer"
          >
            <i className="fas fa-times"></i>
          </span>
        </div>

        <div className="mb-4">
          <div className="text-center mb-2">
            <h4 className="font-semibold text-lg">THÔNG TIN THANH TOÁN</h4>
            <p className="text-sm text-gray-600">
              Mã đặt lịch: {payment.bookingId?.substring(0, 8)}
            </p>
          </div>

          <div className="text-center mb-4">
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(payment.amount || 0)}
            </p>
          </div>
        </div>

        <div className="p-2 border-2 border-primary rounded-lg mb-4">
          <QRCode
            value={getQRData()}
            size={256}
            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            viewBox={`0 0 256 256`}
          />
        </div>

        {/* Chỉ hiển thị mã xác thực nếu không phải trang profile */}
        {!isProfilePage && (
          <div className="mb-4 bg-blue-50 p-3 rounded-lg text-center">
            <p className="font-semibold text-blue-800 mb-1">MÃ XÁC THỰC</p>
            <div className="flex justify-center">
              <div className="bg-white border-2 border-blue-500 rounded px-3 py-2 tracking-widest font-mono text-xl font-bold text-blue-800">
                {verificationCode}
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Cung cấp mã này cho nhân viên khi thanh toán
            </p>
          </div>
        )}

        <div className="bg-gray-100 p-3 rounded-lg">
          <div className="mb-2">
            <p className="font-semibold">Thông tin khách hàng:</p>
            <p className="text-sm">{payment.customerName}</p>
            {payment.customerPhone && (
              <p className="text-sm">SĐT: {payment.customerPhone}</p>
            )}
          </div>

          {payment.bookingDetails?.services?.length > 0 && (
            <div>
              <p className="font-semibold">Dịch vụ:</p>
              <ul className="text-sm">
                {payment.bookingDetails.services.map((service, index) => (
                  <li key={index} className="flex justify-between">
                    <span>{service.name}</span>
                    <span>{formatCurrency(service.price)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  console.log(payment);

  // Hiển thị trạng thái thanh toán
  const PaymentStatusBadge = () => {
    let bgColor, textColor, icon, text;

    if (payment.status === "UNPAID") {
      bgColor = "bg-yellow-100";
      textColor = "text-yellow-800";
      icon = "fas fa-clock";
      text = "Chưa thanh toán";
    } else if (payment.status === "COMPLETED") {
      bgColor = "bg-green-100";
      textColor = "text-green-800";
      icon = "fas fa-check-circle";
      text = "Đã thanh toán";
    } else {
      bgColor = "bg-red-100";
      textColor = "text-red-800";
      icon = "fas fa-undo";
      text = "Đã hoàn tiền";
    }

    return (
      <div
        className={`flex items-center ${bgColor} ${textColor} px-2 py-1 rounded-full text-xs font-medium`}
      >
        <i className={`${icon} mr-1`}></i>
        <span>{text}</span>
      </div>
    );
  };

  return (
    <div className="payment-qr-container p-2">
      {/* Trạng thái thanh toán và nút xem QR */}
      <div className="flex justify-between items-center mb-2">
        <PaymentStatusBadge />

        {payment.status === "UNPAID" && (
          <span
            className="text-[var(--primary-color)] text-xs cursor-pointer"
            onClick={() => setShowLargeQR(true)}
          >
            <i className="fas fa-qrcode mr-1"></i> Xem mã QR
          </span>
        )}
      </div>

      {/* Hiển thị cho thanh toán chưa hoàn thành */}
      {payment.status === "UNPAID" && (
        <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div
            className="w-16 h-16 cursor-pointer"
            onClick={() => setShowLargeQR(true)}
            title="Nhấp để xem lớn hơn"
          >
            <QRCode
              value={getQRData()}
              size={64}
              style={{ height: "100%", maxWidth: "100%", width: "100%" }}
            />
          </div>

          <div className="ml-3">
            {/* Chỉ hiển thị mã xác thực nếu không phải trang profile */}
            {!isProfilePage && (
              <p className="text-sm mb-1">
                <span className="font-semibold">Mã xác thực:</span>{" "}
                <span className="font-mono font-bold text-blue-600">
                  {verificationCode}
                </span>
              </p>
            )}
            <p className="text-blue-600 font-medium text-xs">
              <i className="fas fa-info-circle mr-1"></i>
              {isProfilePage
                ? "Quét mã QR tại quầy lễ tân để thanh toán"
                : "Cung cấp mã QR hoặc mã xác thực cho nhân viên khi thanh toán"}
            </p>
          </div>
        </div>
      )}

      {/* Modal hiển thị QR lớn */}
      {showLargeQR && <QRModal />}
    </div>
  );
};

PaymentQRCode.propTypes = {
  bookingId: PropTypes.string.isRequired,
  isProfilePage: PropTypes.bool,
};

export default PaymentQRCode;
