import React, { useState, useEffect, useContext } from "react";
import Modal from "react-modal";
import AdminService from "../../../services/AdminService";
import { MessageContext } from "../../contexts/MessageProvider";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    maxWidth: "600px",
    borderRadius: "8px",
    padding: "20px",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
};

const Appointments = () => {
  const [showCancelled, setShowCancelled] = useState(true);
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const message = useContext(MessageContext);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await AdminService.getAllBookings(
          activeFilter === "Tất cả" ? null : activeFilter
        );

        if (!Array.isArray(data)) {
          throw new Error("Invalid data format received from server");
        }

        const sortedData = data.sort((a, b) => {
          const dateA = new Date(a.createdAt);
          const dateB = new Date(b.createdAt);
          return dateB - dateA;
        });

        setAppointments(sortedData);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setError("Không thể tải danh sách lịch đặt. Vui lòng thử lại sau!");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [activeFilter]);

  const formatDateTime = (bookingDate, startTime) => {
    try {
      if (!bookingDate || !startTime) return "Chưa có thời gian";
      const dateTimeStr = `${bookingDate}T${startTime}`;
      return new Date(dateTimeStr).toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Định dạng thời gian không hợp lệ";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "PENDING":
        return "Chờ xác nhận";
      case "CONFIRMED":
        return "Đã xác nhận";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await AdminService.updateBookingStatus(appointmentId, newStatus);

      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment.id === appointmentId
            ? { ...appointment, status: newStatus }
            : appointment
        )
      );

      message.success(`Đã cập nhật trạng thái lịch hẹn thành công!`);
    } catch (error) {
      console.error("Error updating appointment status:", error);
      message.error(
        "Không thể cập nhật trạng thái lịch hẹn. Vui lòng thử lại sau!"
      );
    }
  };

  const getFilteredAppointments = () => {
    let filtered = [...appointments];

    if (!showCancelled) {
      filtered = filtered.filter(
        (appointment) => appointment.status !== "CANCELLED"
      );
    }

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((appointment) => {
        return (
          appointment.customerName?.toLowerCase().includes(term) ||
          appointment.customerEmail?.toLowerCase().includes(term) ||
          appointment.customerPhone?.toLowerCase().includes(term) ||
          appointment.staffName?.toLowerCase().includes(term) ||
          appointment.services?.some((s) =>
            s.name?.toLowerCase().includes(term)
          )
        );
      });
    }

    return filtered;
  };

  const getFilterStyle = (filterValue) => {
    const isActive = activeFilter === filterValue;
    return `px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors duration-200 ${
      isActive
        ? "bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]"
        : "text-gray-500 hover:bg-gray-100"
    }`;
  };

  const openModal = (appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-xl font-bold mb-6">Quản lý lịch đặt</h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="mb-4 md:mb-0 w-full">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <i className="fas fa-search w-5 h-5 text-gray-400"></i>
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="Tìm kiếm lịch đặt..."
                />
              </div>
            </div>
            <div className="flex items-center w-40 ml-5">
              <input
                id="show-cancelled"
                type="checkbox"
                className="h-4 w-4 text-pink-500 focus:ring-pink-400 border-gray-300 rounded"
                checked={showCancelled}
                onChange={(e) => setShowCancelled(e.target.checked)}
              />
              <label
                htmlFor="show-cancelled"
                className="ml-2 text-sm text-gray-700"
              >
                Hiển thị đã hủy
              </label>
            </div>
          </div>

          <div className="p-4">
            <div className="flex space-x-2 overflow-x-auto">
              {["Tất cả", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map(
                (status) => (
                  <span
                    key={status}
                    className={getFilterStyle(status)}
                    onClick={() => setActiveFilter(status)}
                  >
                    {getStatusText(status)}
                  </span>
                )
              )}
            </div>
          </div>

          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-800">
                Danh sách lịch đặt
              </h2>
              <div className="text-sm text-gray-500">
                Hiển thị: {getFilteredAppointments().length} lịch đặt
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                <p>{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 text-pink-500 hover:text-pink-600"
                >
                  Thử lại
                </button>
              </div>
            ) : (
              <div className="overflow-x-hidden">
                <table className="min-w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <th className="px-6 py-3 border-b">Khách hàng</th>
                      <th className="px-6 py-3 border-b">Liên hệ</th>
                      <th className="px-6 py-3 border-b">Dịch vụ</th>
                      <th className="px-6 py-3 border-b">Chuyên viên</th>
                      <th className="px-6 py-3 border-b">Ngày giờ</th>
                      <th className="px-6 py-3 border-b">Trạng thái</th>
                      <th className="px-6 py-3 border-b">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {getFilteredAppointments().length > 0 ? (
                      getFilteredAppointments().map((appointment) => (
                        <tr key={appointment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {appointment.customerName}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {appointment.customerEmail}
                            </div>
                            <div className="text-sm text-gray-500">
                              {appointment.customerPhone}
                            </div>
                          </td>
                          <td className="px-6 py-4 line-clamp-2">
                            {appointment.services
                              ?.map((s) => s.name)
                              .join(", ") || "Chưa có dịch vụ"}
                          </td>
                          <td className="px-6 py-4">{appointment.staffName}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {appointment.formattedDateTime ||
                              formatDateTime(
                                appointment.bookingDate,
                                appointment.startTime
                              )}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`min-w-[100px] flex justify-center px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(
                                appointment.status
                              )}`}
                            >
                              {getStatusText(appointment.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {appointment.status === "PENDING" ? (
                              <div className="flex space-x-2 items-center whitespace-nowrap">
                                <span
                                  className="text-blue-500 hover:text-blue-700 bg-blue-100 hover:bg-blue-200 p-1 rounded cursor-pointer"
                                  onClick={() =>
                                    handleStatusUpdate(
                                      appointment.id,
                                      "CONFIRMED"
                                    )
                                  }
                                >
                                  <i className="fas fa-check"></i> Xác nhận
                                </span>
                                <span
                                  className="text-red-500 hover:text-red-700 bg-red-100 hover:bg-red-200 p-1 rounded cursor-pointer"
                                  onClick={() =>
                                    handleStatusUpdate(
                                      appointment.id,
                                      "CANCELLED"
                                    )
                                  }
                                >
                                  <i className="fas fa-times"></i> Hủy
                                </span>
                                <span
                                  className="text-black hover:opacity-80 p-1 rounded cursor-pointer"
                                  onClick={() => openModal(appointment)}
                                >
                                  <i className="fas fa-info-circle"></i> Chi
                                  tiết
                                </span>
                              </div>
                            ) : appointment.status === "CONFIRMED" ? (
                              <div className="flex space-x-2 items-center">
                                <span
                                  className="text-green-500 hover:text-green-700 bg-green-100 hover:bg-green-200 p-1 rounded cursor-pointer"
                                  onClick={() =>
                                    handleStatusUpdate(
                                      appointment.id,
                                      "COMPLETED"
                                    )
                                  }
                                >
                                  <i className="fas fa-check"></i> Hoàn thành
                                </span>
                                <span
                                  className="text-black hover:opacity-80 p-1 rounded cursor-pointer"
                                  onClick={() => openModal(appointment)}
                                >
                                  <i className="fas fa-info-circle"></i> Chi
                                  tiết
                                </span>
                              </div>
                            ) : (
                              <span
                                className="text-black hover:opacity-80 p-1 rounded cursor-pointer"
                                onClick={() => openModal(appointment)}
                              >
                                <i className="fas fa-info-circle"></i> Chi tiết
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="7"
                          className="text-center text-gray-500 p-2 font-medium"
                        >
                          Không có dữ liệu
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Modal chi tiết lịch đặt */}
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          style={customStyles}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">
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

          {/* Content */}
          {selectedAppointment ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-600">
                    Mã lịch đặt
                  </label>
                  <p className="mt-1 text-base text-gray-900 bg-gray-50 rounded-lg p-3">
                    {selectedAppointment.id}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600">
                    Khách hàng
                  </label>
                  <p className="mt-1 text-base text-gray-900 bg-gray-50 rounded-lg p-3">
                    {selectedAppointment.customerName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600">
                    Liên hệ
                  </label>
                  <div className="mt-1 bg-gray-50 rounded-lg p-3">
                    <p className="text-base text-gray-900">
                      Email: {selectedAppointment.customerEmail}
                    </p>
                    <p className="text-base text-gray-900 mt-1">
                      SĐT: {selectedAppointment.customerPhone}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600">
                    Dịch vụ
                  </label>
                  <p className="mt-1 text-base text-gray-900 bg-gray-50 rounded-lg p-3">
                    {selectedAppointment.services
                      ?.map((s) => s.name)
                      .join(", ") || "Chưa có dịch vụ"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600">
                    Chuyên viên
                  </label>
                  <p className="mt-1 text-base text-gray-900 bg-gray-50 rounded-lg p-3">
                    {selectedAppointment.staffName || "Chưa phân công"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600">
                    Thời gian
                  </label>
                  <p className="mt-1 text-base text-gray-900 bg-gray-50 rounded-lg p-3">
                    {selectedAppointment.formattedDateTime ||
                      formatDateTime(
                        selectedAppointment.bookingDate,
                        selectedAppointment.startTime
                      )}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600">
                    Trạng thái
                  </label>
                  <span
                    className={`mt-2 inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${getStatusClasses(
                      selectedAppointment.status
                    )}`}
                  >
                    {getStatusText(selectedAppointment.status)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-600">
                    Ngày tạo
                  </label>
                  <p className="mt-1 text-base text-gray-900 bg-gray-50 rounded-lg p-3">
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
                {selectedAppointment.notes && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-600">
                      Ghi chú
                    </label>
                    <p className="mt-1 text-base text-gray-900 bg-gray-50 rounded-lg p-3">
                      {selectedAppointment.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500">
              Không có dữ liệu lịch đặt
            </p>
          )}

          {/* Footer */}
          <div className="flex justify-end mt-8">
            <span
              onClick={closeModal}
              className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg hover:bg-[var(--primary-color)] transition-colors duration-200 font-medium cursor-pointer"
            >
              Đóng
            </span>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Appointments;
