import React from "react";
import { useNavigate } from "react-router-dom";

const BookingSuccess = ({ successData, formData, countdown, services, selectedServices }) => {
  const navigate = useNavigate();

  return (
    <div className="my-30">
      <div className="w-[900px] mx-auto">
        <div className="p-8 border-3 border-[var(--primary-color)]/50 rounded-2xl bg-white shadow-lg">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-6">
              <i className="fas fa-check text-green-500 text-3xl"></i>
            </div>
            <h2 className="text-3xl font-bold text-green-600 mb-4">
              Đặt lịch thành công!
            </h2>
            <p className="text-lg mb-6">
              Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">Thông tin đặt lịch</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Dịch vụ</p>
                <p className="font-medium">
                  {successData?.services?.map((s) => s.name).join(", ") ||
                    selectedServices
                      .map(
                        (serviceId) =>
                          services.find((s) => s.id === serviceId)?.name
                      )
                      .filter(Boolean)
                      .join(", ") ||
                    "Không có thông tin"}
                </p>
              </div>

              <div>
                <p className="text-gray-600">Chuyên viên</p>
                <p className="font-medium">
                  {successData?.staffName || "Chưa cập nhật"}
                </p>
              </div>

              <div>
                <p className="text-gray-600">Họ tên khách hàng</p>
                <p className="font-medium">
                  {successData?.customerName || formData.fullName}
                </p>
              </div>

              <div>
                <p className="text-gray-600">Số điện thoại</p>
                <p className="font-medium">
                  {successData?.customerPhone || formData.phone}
                </p>
              </div>

              <div>
                <p className="text-gray-600">Ngày</p>
                <p className="font-medium">
                  {successData?.bookingDate || formData.bookingDate}
                </p>
              </div>

              <div>
                <p className="text-gray-600">Giờ</p>
                <p className="font-medium">
                  {successData?.startTime || formData.startTime}
                </p>
              </div>

              <div>
                <p className="text-gray-600">Tổng tiền</p>
                <p className="font-medium">
                  {new Intl.NumberFormat("vi-VN").format(
                    successData?.totalPrice || 0
                  )}
                  đ
                </p>
              </div>

              <div>
                <p className="text-gray-600">Trạng thái</p>
                <p className="font-medium bg-yellow-100 text-yellow-800 px-2 py-1 rounded inline-block">
                  {successData?.statusDescription || "Chờ xác nhận"}
                </p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Bạn sẽ được chuyển đến trang cá nhân sau {countdown} giây...
            </p>
            <div className="flex justify-center space-x-4">
              <span
                onClick={() => navigate("/")}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Trang chủ
              </span>
              <span
                onClick={() => navigate("/profile")}
                className="px-6 py-2 bg-[var(--primary-color)] text-white rounded-md hover:opacity-80 cursor-pointer"
              >
                Xem lịch đặt
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess; 