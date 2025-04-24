import React from "react";
import { formatCurrency } from "../../../../utils/formatters";

const formatDateTime = (bookingDate, startTime) => {
  if (!bookingDate) return "N/A";
  const date = new Date(bookingDate);
  const formattedDate = date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  if (!startTime) return formattedDate;
  return `${formattedDate} ${startTime}`;
};

const VerificationModal = ({
  currentBooking,
  verificationCode,
  verificationError,
  verifyingPayment,
  onSubmit,
  onCodeChange,
  onClose,
  onViewQR,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 bg-opacity-50">
    <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 overflow-hidden">
      <div className="bg-[var(--primary-color)] text-white p-4">
        <h3 className="text-lg font-medium">Xác nhận thanh toán</h3>
        <p className="text-sm opacity-80">
          Nhập mã xác thực để hoàn tất thanh toán
        </p>
      </div>

      {currentBooking && (
        <div className="p-4 bg-[var(--primary-color)]/10 border-b border-blue-100">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Khách hàng:
            </span>
            <span className="text-sm font-semibold">
              {currentBooking.customerName}
            </span>
          </div>
          {currentBooking.customerPhone && (
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Số điện thoại:
              </span>
              <span className="text-sm">{currentBooking.customerPhone}</span>
            </div>
          )}
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Ngày đặt:
            </span>
            <span className="text-sm">
              {formatDateTime(
                currentBooking.bookingDate,
                currentBooking.startTime
              )}
            </span>
          </div>
          <div className="flex justify-between font-semibold">
            <span className="text-sm text-gray-600">Tổng tiền:</span>
            <span className="text-sm text-blue-600">
              {formatCurrency(currentBooking.totalPrice || 0)}
            </span>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="p-4">
        <div className="mb-4">
          <label
            htmlFor="verification-code"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Mã xác thực
          </label>
          <input
            id="verification-code"
            type="text"
            className="w-full p-2 outline-none border border-gray-300 rounded-md font-mono tracking-wider text-center uppercase focus:border-[var(--primary-color)]"
            placeholder="Nhập mã xác thực"
            value={verificationCode}
            onChange={onCodeChange}
            autoFocus
            maxLength={10}
          />
          {verificationError && (
            <p className="mt-1 text-xs text-red-500">{verificationError}</p>
          )}
        </div>

        <div className="mb-4 text-center">
          <span
            className="text-[var(--primary-color)] text-sm cursor-pointer"
            onClick={onViewQR}
          >
            <i className="fas fa-qrcode mr-1"></i> Xem QR code và mã xác thực
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span
            className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            onClick={onClose}
          >
            Hủy
          </span>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-[var(--primary-color)] text-white rounded-md hover:bg-[var(--primary-color)]/80 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            disabled={verifyingPayment}
          >
            {verifyingPayment ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>
                Đang xác thực...
              </>
            ) : (
              "Xác thực thanh toán"
            )}
          </button>
        </div>
      </form>
    </div>
  </div>
);

export default VerificationModal; 