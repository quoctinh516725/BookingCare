import React, { useEffect } from "react";
import Modal from "react-modal";
import { useAppointments } from "../../contexts/AppointmentContext";
import AppointmentStatusBadge from "./AppointmentStatusBadge";
import PaymentStatusBadge from "./PaymentStatusBadge";
import ServiceItem from "./ServiceItem";
import StarRating from "./StarRating";

Modal.setAppElement("#root");

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    maxWidth: "800px",
    width: "90%",
    maxHeight: "90vh",
    overflow: "auto",
    borderRadius: "12px",
    padding: "24px",
    boxShadow:
      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    zIndex: 1000,
  },
};

const AppointmentDetailModal = () => {
  const {
    selectedAppointment,
    setSelectedAppointment,
    feedback,
    feedbackLoading,
    paymentStatuses,
    formatDateTime,
    updateAppointmentStatus,
    getAppointmentFeedback
  } = useAppointments();

  const isOpen = Boolean(selectedAppointment);

  useEffect(() => {
    if (selectedAppointment && selectedAppointment.status === "COMPLETED") {
      getAppointmentFeedback(selectedAppointment.id);
    }
  }, [selectedAppointment, getAppointmentFeedback]);

  const closeModal = () => {
    setSelectedAppointment(null);
  };

  if (!selectedAppointment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      style={customStyles}
      contentLabel="Chi tiết lịch đặt"
    >
      <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Chi tiết lịch đặt
        </h2>
        <span
          onClick={closeModal}
          className="text-gray-500 hover:text-gray-700 transition-colors duration-200 cursor-pointer"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </span>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
              Thông tin khách hàng
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Tên khách hàng
                </label>
                <p className="text-base font-medium text-gray-900">
                  {selectedAppointment.customerName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Email
                </label>
                <p className="text-base text-gray-900">
                  {selectedAppointment.customerEmail}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Số điện thoại
                </label>
                <p className="text-base text-gray-900">
                  {selectedAppointment.customerPhone}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
              Thông tin lịch hẹn
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Mã lịch đặt
                </label>
                <p className="text-xs font-mono text-gray-600 bg-gray-50 p-2 rounded">
                  {selectedAppointment.id}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Thời gian
                </label>
                <p className="text-base text-gray-900 flex items-center">
                  <i className="far fa-calendar-alt mr-2 text-[var(--primary-color)]"></i>
                  {selectedAppointment.formattedDateTime ||
                    formatDateTime(
                      selectedAppointment.bookingDate,
                      selectedAppointment.startTime
                    )}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Trạng thái
                </label>
                <AppointmentStatusBadge status={selectedAppointment.status} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Trạng thái thanh toán
                </label>
                <PaymentStatusBadge
                  status={paymentStatuses[selectedAppointment.id]}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
            Chi tiết dịch vụ
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Chuyên viên
              </label>
              <p className="text-base text-gray-900 flex items-center">
                <i className="fas fa-user-md mr-2 text-[var(--primary-color)]"></i>
                {selectedAppointment.staffName || "Chưa phân công"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Dịch vụ
              </label>
              {selectedAppointment.services &&
              selectedAppointment.services.length > 0 ? (
                <div className="mt-2 space-y-2">
                  {selectedAppointment.services.map((service, index) => (
                    <ServiceItem key={index} service={service} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">Chưa có dịch vụ</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Tổng giá trị
              </label>
              <p className="text-lg font-semibold text-[var(--primary-color)]">
                {new Intl.NumberFormat("vi-VN").format(
                  selectedAppointment.totalPrice || 0
                )}
                ₫
              </p>
            </div>
          </div>
        </div>

        {selectedAppointment.status === "COMPLETED" && (
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
              Phản hồi của khách hàng
            </h3>

            {feedbackLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)]"></div>
              </div>
            ) : feedback ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Đánh giá
                  </label>
                  <div className="flex items-center">
                    <StarRating rating={feedback.rating} showValue={true} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Nhận xét
                  </label>
                  {feedback.comment ? (
                    <div className="bg-gray-50 p-3 rounded-md text-gray-700">
                      <i className="fas fa-quote-left text-gray-400 mr-2"></i>
                      {feedback.comment}
                      <i className="fas fa-quote-right text-gray-400 ml-2"></i>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">
                      Khách hàng không để lại nhận xét
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Thời gian đánh giá
                  </label>
                  <p className="text-sm text-gray-600">
                    {new Date(feedback.createdAt).toLocaleString(
                      "vi-VN",
                      {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <i className="far fa-comment-dots text-4xl mb-2 text-gray-300"></i>
                <p>Khách hàng chưa để lại đánh giá nào</p>
              </div>
            )}
          </div>
        )}

        {selectedAppointment.notes && (
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
              Ghi chú
            </h3>
            <p className="text-gray-700 whitespace-pre-line">
              {selectedAppointment.notes}
            </p>
          </div>
        )}

        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-500">
            Ngày tạo:{" "}
            {new Date(selectedAppointment.createdAt).toLocaleString(
              "vi-VN",
              {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              }
            )}
          </p>
        </div>
      </div>

      <div className="flex justify-end mt-8 pt-4 border-t border-gray-200">
        {selectedAppointment &&
          selectedAppointment.status === "PENDING" && (
            <>
              <button
                onClick={() =>
                  updateAppointmentStatus(selectedAppointment.id, "CONFIRMED")
                }
                className="px-4 py-2 bg-blue-500 text-white rounded-lg mr-3 hover:bg-blue-600 transition-colors duration-200 font-medium"
              >
                <i className="fas fa-check mr-2"></i> Xác nhận
              </button>
              <button
                onClick={() =>
                  updateAppointmentStatus(selectedAppointment.id, "CANCELLED")
                }
                className="px-4 py-2 bg-red-500 text-white rounded-lg mr-3 hover:bg-red-600 transition-colors duration-200 font-medium"
              >
                <i className="fas fa-times mr-2"></i> Hủy
              </button>
            </>
          )}

        {selectedAppointment &&
          selectedAppointment.status === "CONFIRMED" && (
            <button
              onClick={() =>
                updateAppointmentStatus(selectedAppointment.id, "COMPLETED")
              }
              className="px-4 py-2 bg-green-500 text-white rounded-lg mr-3 hover:bg-green-600 transition-colors duration-200 font-medium"
            >
              <i className="fas fa-check-double mr-2"></i> Hoàn thành
            </button>
          )}

        <button
          onClick={closeModal}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
        >
          Đóng
        </button>
      </div>
    </Modal>
  );
};

export default AppointmentDetailModal; 