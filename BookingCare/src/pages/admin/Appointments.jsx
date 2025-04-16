import React, {
  useState,
  useEffect,
  useContext,
  useMemo,
  useCallback,
} from "react";
import Modal from "react-modal";
import AdminService from "../../../services/AdminService";
import FeedbackService from "../../../services/FeedbackService";
import PaymentService from "../../../services/PaymentService";
import { MessageContext } from "../../contexts/MessageProvider";
import Pagination from "../../components/Pagination/Pagination";

// Custom components
const StatusBadge = React.memo(({ status }) => {
  const statusClasses = useMemo(() => {
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
  }, [status]);

  const statusText = useMemo(() => {
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
  }, [status]);

  return (
    <span
      className={`min-w-[100px] flex justify-center px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses}`}
    >
      {statusText}
    </span>
  );
});

const PaymentStatusBadge = React.memo(({ status }) => {
  const paymentClasses = useMemo(() => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "UNPAID":
        return "bg-yellow-100 text-yellow-800";
      case "REFUNDED":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }, [status]);

  const paymentText = useMemo(() => {
    switch (status) {
      case "UNPAID":
        return "Chưa thanh toán";
      case "COMPLETED":
        return "Đã thanh toán";
      case "REFUNDED":
        return "Đã hoàn tiền";
      default:
        return "Chưa thanh toán";
    }
  }, [status]);

  return (
    <span
      className={`min-w-[100px] flex justify-center px-3 py-1 inline-flex text-xs leading-5 font-semibold whitespace-nowrap rounded-full ${paymentClasses}`}
    >
      {paymentText}
    </span>
  );
});

const ServiceItem = React.memo(({ service }) => (
  <div className="flex items-start p-3 bg-gray-50 rounded-md">
    {service.image && (
      <img
        src={service.image}
        alt={service.name}
        className="w-12 h-12 object-cover rounded-md mr-3"
      />
    )}
    <div>
      <p className="font-medium text-gray-900">{service.name}</p>
      <div className="flex items-center text-sm text-gray-500 mt-1">
        <span className="mr-3">
          {new Intl.NumberFormat("vi-VN").format(service.price)}₫
        </span>
        <span>{service.duration} phút</span>
      </div>
    </div>
  </div>
));

const StarRating = React.memo(({ rating }) => {
  if (!rating) return null;

  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <i
          key={i}
          className={`fas fa-star ${
            i <= rating ? "text-yellow-400" : "text-gray-300"
          }`}
        ></i>
      ))}
    </div>
  );
});

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

const Appointments = () => {
  const [showCancelled, setShowCancelled] = useState(true);
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [appointments, setAppointments] = useState([]);
  const [paymentStatuses, setPaymentStatuses] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const message = useContext(MessageContext);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const formatDateTime = useCallback((bookingDate, startTime) => {
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
  }, []);

  const fetchPaymentStatuses = useCallback(async (appointments) => {
    const statuses = {};
    const promises = appointments.map(async (appointment) => {
      try {
        const response = await PaymentService.getPaymentByBookingId(
          appointment.id
        );
        statuses[appointment.id] = response.success
          ? response.data.status || "UNPAID"
          : "UNPAID";
      } catch (err) {
        console.error(
          `Error fetching payment status for appointment ${appointment.id}:`,
          err
        );
        statuses[appointment.id] = "UNPAID";
      }
    });

    await Promise.all(promises);
    setPaymentStatuses(statuses);
  }, []);

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
        fetchPaymentStatuses(sortedData);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setError("Không thể tải danh sách lịch đặt. Vui lòng thử lại sau!");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [activeFilter, fetchPaymentStatuses]);

  const handleStatusUpdate = useCallback(
    async (appointmentId, newStatus) => {
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
    },
    [message]
  );

  const getFilteredAppointments = useMemo(() => {
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
  }, [appointments, showCancelled, searchTerm]);

  const getFilterStyle = useCallback(
    (filterValue) => {
      const isActive = activeFilter === filterValue;
      return `px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors duration-200 ${
        isActive
          ? "bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]"
          : "text-gray-500 hover:bg-gray-100"
      }`;
    },
    [activeFilter]
  );

  const openModal = useCallback(async (appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);

    if (appointment.status === "COMPLETED") {
      setFeedbackLoading(true);
      try {
        const response = await FeedbackService.getFeedbackByBooking(
          appointment.id
        );
        if (response.success && response.data && response.data.length > 0) {
          setFeedback(response.data[0]);
        } else {
          setFeedback(null);
        }
      } catch (error) {
        console.error("Error fetching feedback:", error);
        setFeedback(null);
      } finally {
        setFeedbackLoading(false);
      }
    } else {
      setFeedback(null);
    }
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
    setFeedback(null);
  }, []);

  const AppointmentRow = React.memo(({ appointment }) => (
    <tr key={appointment.id} className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900">
          {appointment.customerName}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900">{appointment.customerEmail}</div>
        <div className="text-sm text-gray-500">{appointment.customerPhone}</div>
      </td>
      <td className="px-6 py-4 line-clamp-2">
        {appointment.services?.map((s) => s.name).join(", ") ||
          "Chưa có dịch vụ"}
      </td>
      <td className="px-6 py-4">{appointment.staffName}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        {appointment.formattedDateTime ||
          formatDateTime(appointment.bookingDate, appointment.startTime)}
      </td>
      <td className="px-6 py-4">
        <StatusBadge status={appointment.status} />
      </td>
      <td className="px-6 py-4">
        <PaymentStatusBadge status={paymentStatuses[appointment.id]} />
      </td>
      <td className="px-6 py-4">
        {appointment.status === "PENDING" ? (
          <div className="flex space-x-2 items-center whitespace-nowrap">
            <span
              className="text-blue-500 hover:text-blue-700 bg-blue-100 hover:bg-blue-200 p-1 rounded cursor-pointer"
              onClick={() => handleStatusUpdate(appointment.id, "CONFIRMED")}
            >
              <i className="fas fa-check"></i> Xác nhận
            </span>
            <span
              className="text-red-500 hover:text-red-700 bg-red-100 hover:bg-red-200 p-1 rounded cursor-pointer"
              onClick={() => handleStatusUpdate(appointment.id, "CANCELLED")}
            >
              <i className="fas fa-times"></i> Hủy
            </span>
            <span
              className="text-black hover:opacity-80 p-1 rounded cursor-pointer"
              onClick={() => openModal(appointment)}
            >
              <i className="fas fa-info-circle"></i> Chi tiết
            </span>
          </div>
        ) : appointment.status === "CONFIRMED" ? (
          <div className="flex space-x-2 items-center">
            <span
              className="text-green-500 hover:text-green-700 bg-green-100 hover:bg-green-200 p-1 rounded cursor-pointer"
              onClick={() => handleStatusUpdate(appointment.id, "COMPLETED")}
            >
              <i className="fas fa-check"></i> Hoàn thành
            </span>
            <span
              className="text-black hover:opacity-80 p-1 rounded cursor-pointer"
              onClick={() => openModal(appointment)}
            >
              <i className="fas fa-info-circle"></i> Chi tiết
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
  ));
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

  // Get paginated data
  const getPaginatedData = () => {
    const filteredData = getFilteredAppointments;
    const totalItems = filteredData.length;

    // Ensure current page is valid
    const totalPages = Math.ceil(totalItems / pageSize);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }

    const indexOfLastItem = currentPage * pageSize;
    const indexOfFirstItem = indexOfLastItem - pageSize;
    return {
      data: filteredData.slice(indexOfFirstItem, indexOfLastItem),
      totalItems,
    };
  };

  // Handle page change
  const handlePageChange = (page, newPageSize) => {
    setCurrentPage(page);
    if (newPageSize) {
      setPageSize(newPageSize);
    }
  };

  // Update search handler to reset page
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Update filter handlers to reset page
  const handleFilterChange = (filterValue) => {
    setActiveFilter(filterValue);
    setCurrentPage(1);
  };

  const handleShowCancelledChange = (e) => {
    setShowCancelled(e.target.checked);
    setCurrentPage(1);
  };

  // Get paginated data for display
  const { data: paginatedAppointments, totalItems } = getPaginatedData();

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
                  onChange={handleSearch}
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
                onChange={handleShowCancelledChange}
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
                    onClick={() => handleFilterChange(status)}
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
                Hiển thị: {paginatedAppointments.length} lịch đặt
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
              <>
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
                        <th className="px-6 py-3 border-b">Thanh toán</th>
                        <th className="px-6 py-3 border-b">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paginatedAppointments.length > 0 ? (
                        paginatedAppointments.map((appointment) => (
                          <AppointmentRow
                            key={appointment.id}
                            appointment={appointment}
                          />
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

                <Pagination
                  currentPage={currentPage}
                  totalItems={totalItems}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                  onShowSizeChange={handlePageChange}
                />
              </>
            )}
          </div>
        </div>

        {/* Modal chi tiết lịch đặt */}
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          style={customStyles}
          contentLabel="Chi tiết lịch đặt"
          ariaHideApp={false}
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

          {selectedAppointment ? (
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
                      <StatusBadge status={selectedAppointment.status} />
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
                          <StarRating rating={feedback.rating} />
                          <span className="ml-2 text-gray-700">
                            {feedback.rating}/5
                          </span>
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
          ) : (
            <div className="text-center py-10 text-gray-500">
              <i className="far fa-calendar-check text-5xl mb-3 text-gray-300"></i>
              <p>Không có dữ liệu lịch đặt</p>
            </div>
          )}

          <div className="flex justify-end mt-8 pt-4 border-t border-gray-200">
            {selectedAppointment &&
              selectedAppointment.status === "PENDING" && (
                <>
                  <button
                    onClick={() =>
                      handleStatusUpdate(selectedAppointment.id, "CONFIRMED")
                    }
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg mr-3 hover:bg-blue-600 transition-colors duration-200 font-medium"
                  >
                    <i className="fas fa-check mr-2"></i> Xác nhận
                  </button>
                  <button
                    onClick={() =>
                      handleStatusUpdate(selectedAppointment.id, "CANCELLED")
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
                    handleStatusUpdate(selectedAppointment.id, "COMPLETED")
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
      </div>
    </div>
  );
};

export default Appointments;
