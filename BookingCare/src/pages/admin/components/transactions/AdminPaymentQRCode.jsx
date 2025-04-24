import React from "react";
import PaymentQRCode from "../../../../components/Payment/PaymentQRCode";

// Component hiển thị mã QR cho admin
const AdminPaymentQRCode = ({ bookingId, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 overflow-hidden p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Mã QR thanh toán</h3>
          <span
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            <i className="fas fa-times"></i>
          </span>
        </div>

        <PaymentQRCode bookingId={bookingId} isProfilePage={false} />

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 mb-2">
            Quét mã QR hoặc nhập mã xác thực ở trên để xác nhận thanh toán
          </p>
          <span
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 cursor-pointer"
          >
            Đóng
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentQRCode; 