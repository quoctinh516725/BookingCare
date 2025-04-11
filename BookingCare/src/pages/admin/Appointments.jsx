import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminService from "../../../services/AdminService";
import { MessageContext } from "../../contexts/MessageProvider";

const Appointments = () => {
  const [showCancelled, setShowCancelled] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const message = React.useContext(MessageContext);
  console.log("appointments", appointments);
  console.log("activeFilter", activeFilter);

  // Fetch appointments when component mounts or filter changes
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await AdminService.getAllBookings(
          activeFilter === "all" ? null : activeFilter
        );

        // Check if data is an array
        if (!Array.isArray(data)) {
          throw new Error("Invalid data format received from server");
        }

        // Sort appointments by appointmentTime in descending order
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

  // Format date time
  const formatDateTime = (bookingDate, startTime) => {
    try {
      if (!bookingDate || !startTime) return "Chưa có thời gian";

      // Combine bookingDate and startT    const dateTimeStr = `${bookingDate}T${startTime}`;
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

  // Get status text for display
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

  // Get status color and text
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

  // Handle appointment status update
  const handleStatusUpdate = async (appointmentId, newStatus) => {
    try {
      await AdminService.updateBookingStatus(appointmentId, newStatus);

      // Update local state
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

  // Filter appointments based on showCancelled state
  const getFilteredAppointments = () => {
    let filtered = [...appointments];

    // Apply cancelled filter
    if (!showCancelled) {
      filtered = filtered.filter(
        (appointment) => appointment.status !== "CANCELLED"
      );
    }

    return filtered;
  };

  // Get active filter style
  const getFilterStyle = (filterValue) => {
    const isActive = activeFilter === filterValue;
    return `px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors duration-200 ${
      isActive
        ? "bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]"
        : "text-gray-500 hover:bg-gray-100"
    }`;
  };
  console.log("getFilteredAppointments", getFilteredAppointments());
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
              <span
                key="all"
                className={getFilterStyle("all")}
                onClick={() => setActiveFilter("all")}
              >
                Tất cả
              </span>
              <span
                key="PENDING"
                className={getFilterStyle("PENDING")}
                onClick={() => setActiveFilter("PENDING")}
              >
                Chờ xác nhận
              </span>
              <span
                key="CONFIRMED"
                className={getFilterStyle("CONFIRMED")}
                onClick={() => setActiveFilter("CONFIRMED")}
              >
                Đã xác nhận
              </span>
              <span
                key="COMPLETED"
                className={getFilterStyle("COMPLETED")}
                onClick={() => setActiveFilter("COMPLETED")}
              >
                Hoàn thành
              </span>
              <span
                key="CANCELLED"
                className={getFilterStyle("CANCELLED")}
                onClick={() => setActiveFilter("CANCELLED")}
              >
                Đã hủy
              </span>
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
                      <th scope="col" className="px-6 py-3 border-b">
                        Khách hàng
                      </th>
                      <th scope="col" className="px-6 py-3 border-b">
                        Liên hệ
                      </th>
                      <th scope="col" className="px-6 py-3 border-b">
                        Dịch vụ
                      </th>
                      <th scope="col" className="px-6 py-3 border-b">
                        Chuyên viên
                      </th>
                      <th scope="col" className="px-6 py-3 border-b">
                        Ngày giờ
                      </th>
                      <th scope="col" className="px-6 py-3 border-b">
                        Trạng thái
                      </th>
                      <th scope="col" className="px-6 py-3 border-b">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {getFilteredAppointments().length > 0 ? (
                      getFilteredAppointments().map((appointment) => (
                        <tr key={appointment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {appointment.customerName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {appointment.customerEmail}
                            </div>
                            <div className="text-sm text-gray-500">
                              {appointment.customerPhone}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {appointment.services
                                ?.map((s) => s.name)
                                .join(", ") || "Chưa có dịch vụ"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {appointment.staffName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {appointment.formattedDateTime ||
                                formatDateTime(
                                  appointment.bookingDate,
                                  appointment.startTime
                                )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`min-w-[100px] flex justify-center px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(
                                appointment.status
                              )}`}
                            >
                              {getStatusText(appointment.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {appointment.status === "PENDING" ? (
                              <div className="flex space-x-2 items-center">
                                <div className="flex space-x-2 items-center min-w-[140px]">
                                  <span
                                    className="text-blue-500 hover:text-blue-700 bg-blue-100 hover:bg-blue-200 p-1 rounded mr-2 cursor-pointer"
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
                                </div>
                                <Link
                                  to={`/admin/appointments/${appointment.id}`}
                                  className="text-black hover:opacity-80 p-1 rounded cursor-pointer"
                                >
                                  <i className="fas fa-info-circle"></i> Chi
                                  tiết
                                </Link>
                              </div>
                            ) : appointment.status === "CONFIRMED" ? (
                              <div className="flex space-x-2 items-center">
                                <div className="flex space-x-2 items-center min-w-[140px]">
                                  <span
                                    className="text-green-500 hover:text-green-700 bg-green-100 hover:bg-green-200 p-1 rounded font-medium"
                                    onClick={() =>
                                      handleStatusUpdate(
                                        appointment.id,
                                        "COMPLETED"
                                      )
                                    }
                                  >
                                    <i className="fas fa-check"></i> Hoàn thành
                                  </span>
                                </div>
                                <Link
                                  to={`/admin/appointments/${appointment.id}`}
                                  className="text-black hover:opacity-80 p-1 rounded cursor-pointer"
                                >
                                  <i className="fas fa-info-circle"></i> Chi
                                  tiết
                                </Link>
                              </div>
                            ) : (
                              <Link
                                to={`/admin/appointments/${appointment.id}`}
                                className="text-black hover:opacity-80 p-1 rounded cursor-pointer"
                              >
                                <i className="fas fa-info-circle"></i> Chi tiết
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="8"
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
      </div>
    </div>
  );
};

export default Appointments;
