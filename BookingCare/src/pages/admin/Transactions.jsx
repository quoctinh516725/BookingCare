import React, { useState, useEffect } from "react";
import BookingService from "../../../services/BookingService";
import PaymentService from "../../../services/PaymentService";
import { formatCurrency } from "../../utils/formatters";
import { toast } from "sonner";
import PaymentQRCode from "../../components/Payment/PaymentQRCode";
import Pagination from "../../components/Pagination";

// Loader component
const Loader = () => (
  <div className="flex justify-center items-center h-full py-4">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--primary-color)]"></div>
  </div>
);

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

const Transactions = () => {
  const [bookings, setBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [paymentStatuses, setPaymentStatuses] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [verificationError, setVerificationError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllBookings, setShowAllBookings] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState("all");
  const [currentBooking, setCurrentBooking] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch bookings và payment statuses khi component mount
  useEffect(() => {
    fetchBookings();
    fetchAllBookings();
  }, []);

  // Hàm lấy trạng thái thanh toán cho danh sách bookings
  const fetchPaymentStatuses = async (bookings) => {
    setPaymentLoading(true);
    const statuses = {};

    try {
      // Chia nhỏ các booking thành các batch để giảm tải server
      const BATCH_SIZE = 5; // Xử lý 5 booking mỗi lần
      const DELAY_BETWEEN_BATCHES = 300; // ms giữa các batch
      const MAX_RETRIES = 2; // Số lần thử lại tối đa cho mỗi request
      
      // Hàm fetch với retry logic
      const fetchWithRetry = async (bookingId, retries = 0) => {
        try {
          const response = await PaymentService.getPaymentByBookingId(bookingId);
          return {
            bookingId,
            status: response.success ? response.data.status || "UNPAID" : "UNPAID",
          };
        } catch (err) {
          console.warn(`Lỗi khi lấy thông tin thanh toán cho booking ${bookingId}`, err);
          
          // Thử lại nếu chưa quá số lần tối đa
          if (retries < MAX_RETRIES) {
            // Chờ một khoảng thời gian trước khi thử lại
            await new Promise(resolve => setTimeout(resolve, 500));
            return fetchWithRetry(bookingId, retries + 1);
          }
          
          // Nếu vẫn lỗi sau MAX_RETRIES lần thử, trả về UNPAID
          return { bookingId, status: "UNPAID" };
        }
      };
      
      // Chia thành các batch và xử lý
      for (let i = 0; i < bookings.length; i += BATCH_SIZE) {
        const batch = bookings.slice(i, i + BATCH_SIZE);
        
        // Xử lý một batch
        const batchPromises = batch.map(booking => fetchWithRetry(booking.id));
        const batchResults = await Promise.all(batchPromises);
        
        // Cập nhật statuses từ kết quả
        batchResults.forEach(({ bookingId, status }) => {
          statuses[bookingId] = status;
        });
        
        // Nếu còn batch tiếp theo, chờ một chút để tránh quá tải server
        if (i + BATCH_SIZE < bookings.length) {
          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
        }
      }
    } catch (err) {
      console.error("Error fetching payment statuses:", err);
      // Nếu có lỗi, gán mặc định tất cả là UNPAID
      bookings.forEach((booking) => {
        statuses[booking.id] = "UNPAID";
      });
    } finally {
      setPaymentStatuses(statuses);
      setPaymentLoading(false);
    }
  };

  const fetchBookings = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Đang lấy dữ liệu booking gần đây...");
      const response = await BookingService.getRecentBookings(20);
      const bookingsData = response.data || [];
      setBookings(bookingsData);
      await fetchPaymentStatuses(bookingsData);
      if (!response.success) {
        console.warn(
          "Không thể lấy dữ liệu booking gần đây:",
          response.message
        );
      }
      // Reset to page 1 when fetching new data
      setCurrentPage(1);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setBookings([]);
      setError("Không thể tải danh sách lịch hẹn gần đây.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllBookings = async () => {
    setBookingsLoading(true);

    try {
      console.log("Đang lấy tất cả dữ liệu booking...");
      const response = await BookingService.getAllBookings();
      const bookingsData = response.data || [];
      setAllBookings(bookingsData);
      await fetchPaymentStatuses(bookingsData);
      if (!response.success) {
        console.warn("Không thể lấy tất cả dữ liệu booking:", response.message);
      }
      // Reset to page 1 when fetching new data
      setCurrentPage(1);
    } catch (err) {
      console.error("Error fetching all bookings:", err);
      setAllBookings([]);
      setError("Không thể tải danh sách tất cả lịch hẹn.");
    } finally {
      setBookingsLoading(false);
    }
  };

  const openVerificationModal = async (bookingId) => {
    setCurrentBookingId(bookingId);
    setVerificationCode("");
    setVerificationError(null);
    setVerifyingPayment(false);

    try {
      const response = await BookingService.getBookingById(bookingId);
      if (response.success) {
        setCurrentBooking(response.data);
      }
    } catch (err) {
      console.error("Error fetching booking details:", err);
    }

    setShowVerificationModal(true);
  };

  const openQRModal = (bookingId) => {
    setCurrentBookingId(bookingId);
    setShowQRModal(true);
  };

  const closeQRModal = () => {
    setShowQRModal(false);
    setCurrentBookingId(null);
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    setVerifyingPayment(true);

    try {
      const cleanCode = verificationCode.trim().toUpperCase();
      setVerificationCode(cleanCode);

      console.log(
        `Đang xác thực booking ID: ${currentBookingId} với mã: ${cleanCode}`
      );

      const response = await PaymentService.verifyPaymentByCode(
        currentBookingId,
        cleanCode
      );

      if (response.success) {
        toast.success("Xác thực thanh toán thành công!");

        try {
          const updateResponse = await BookingService.updateBookingStatus(
            currentBookingId,
            "COMPLETED"
          );
          if (updateResponse.success) {
            toast.success(
              "Đã cập nhật trạng thái đơn đặt lịch thành Hoàn thành!"
            );
          } else {
            console.warn(
              "Không thể cập nhật trạng thái booking:",
              updateResponse.message
            );
            toast.error("Không thể cập nhật trạng thái đơn đặt lịch.");
          }
        } catch (err) {
          console.error("Error updating booking status:", err);
          toast.error("Lỗi khi cập nhật trạng thái đơn đặt lịch.");
        }

        setVerificationError(null);
        closeVerificationModal();
        fetchBookings();
        if (showAllBookings) {
          fetchAllBookings();
        }
      } else {
        setVerificationError(response.message || "Mã xác thực không hợp lệ");
        console.error("Lỗi xác thực:", response.message);
        if (response.status === 404) {
          setVerificationError("Không tìm thấy thông tin thanh toán.");
        } else if (response.status === 400) {
          setVerificationError("Mã xác thực không hợp lệ hoặc đã hết hạn.");
        } else if (response.status === 403) {
          setVerificationError("Bạn không có quyền xác thực thanh toán này.");
        }
      }
    } catch (error) {
      console.error("Lỗi khi xác thực mã:", error);
      let errorMessage = "Không thể xác thực thanh toán";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      if (error.response?.status === 404) {
        errorMessage = "Không tìm thấy thông tin thanh toán hoặc đặt lịch.";
      } else if (error.response?.status === 401) {
        errorMessage = "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.";
      } else if (!navigator.onLine) {
        errorMessage =
          "Không có kết nối internet. Vui lòng kiểm tra kết nối mạng.";
      }
      setVerificationError(errorMessage);
    } finally {
      setVerifyingPayment(false);
    }
  };

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

  const closeVerificationModal = () => {
    setShowVerificationModal(false);
    setCurrentBookingId(null);
    setVerificationCode("");
    setVerificationError(null);
    setCurrentBooking(null);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleFilterChange = (type, value) => {
    if (type === "status") {
      setFilterStatus(value);
    } else if (type === "paymentStatus") {
      setFilterPaymentStatus(value);
    }
    setCurrentPage(1); // Reset to first page on filter change
  };

  const toggleBookingsView = () => {
    setShowAllBookings(!showAllBookings);
    setCurrentPage(1); // Reset to first page when switching view
  };

  const getFilteredBookings = () => {
    let filtered = showAllBookings ? allBookings : bookings;

    if (filterStatus !== "all") {
      filtered = filtered.filter((booking) => booking.status === filterStatus);
    }

    if (filterPaymentStatus !== "all") {
      filtered = filtered.filter(
        (booking) => paymentStatuses[booking.id] === filterPaymentStatus
      );
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (booking) =>
          (booking.id && booking.id.toLowerCase().includes(query)) ||
          (booking.customerName &&
            booking.customerName.toLowerCase().includes(query)) ||
          (booking.customerPhone &&
            booking.customerPhone.toLowerCase().includes(query))
      );
    }

    return filtered;
  };

  // Get paginated data
  const getPaginatedData = () => {
    const filteredData = getFilteredBookings();
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

  const VerificationModal = () => (
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

        <form onSubmit={handleVerificationSubmit} className="p-4">
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
              onChange={(e) =>
                setVerificationCode(e.target.value.toUpperCase())
              }
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
              onClick={() => {
                closeVerificationModal();
                openQRModal(currentBookingId);
              }}
            >
              <i className="fas fa-qrcode mr-1"></i> Xem QR code và mã xác thực
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span
              className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              onClick={closeVerificationModal}
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

  // Get paginated data for display
  const { data: paginatedBookings, totalItems } = getPaginatedData();

  return (
    <div className="transactions-container p-6">
      <h1 className="text-2xl font-bold mb-6">Quản lý giao dịch</h1>

      {/* Tìm kiếm và bộ lọc */}
      <div className="mb-4 bg-white p-3 rounded shadow">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Tìm theo ID, tên khách hàng hoặc số điện thoại"
              value={searchQuery}
              onChange={handleSearch}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            />
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="PENDING">Chờ xác nhận</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="COMPLETED">Hoàn thành</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>

          <div>
            <select
              value={filterPaymentStatus}
              onChange={(e) =>
                handleFilterChange("paymentStatus", e.target.value)
              }
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
            >
              <option value="all">Tất cả TT thanh toán</option>
              <option value="UNPAID">Chưa thanh toán</option>
              <option value="COMPLETED">Đã thanh toán</option>
              <option value="REFUNDED">Đã hoàn tiền</option>
            </select>
          </div>

          <div>
            <span
              onClick={toggleBookingsView}
              className="px-3 py-2 rounded-md bg-[var(--primary-color)] text-white cursor-pointer"
            >
              {showAllBookings ? "Xem gần đây" : "Xem tất cả"}
            </span>
          </div>
        </div>
      </div>

      {isLoading || (showAllBookings && bookingsLoading) ? (
        <div className="loading-container bg-white p-10 rounded shadow flex justify-center">
          <Loader />
        </div>
      ) : error ? (
        <div className="error-message bg-red-50 p-6 rounded shadow text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <span
            onClick={fetchBookings}
            className="px-3 py-1 bg-[var(--primary-color)] text-white rounded hover:bg-[var(--primary-color)]/80"
          >
            Thử lại
          </span>
        </div>
      ) : (
        <div className="bookings-section bg-white p-4 rounded shadow">
          <h2 className="text-lg font-medium mb-4">
            Danh sách lịch hẹn {showAllBookings ? "" : "gần đây"}
          </h2>

          {paginatedBookings.length === 0 ? (
            <p className="text-center py-4 text-gray-500">
              Không có lịch hẹn nào phù hợp
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="bookings-table w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 text-left">ID</th>
                      <th className="p-2 text-left">Khách hàng</th>
                      <th className="p-2 text-left">Thời gian</th>
                      <th className="p-2 text-left">Tổng giá</th>
                      <th className="p-2 text-left">Trạng thái</th>
                      <th className="p-2 text-left">Thanh toán</th>
                      <th className="p-2 text-left">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedBookings.map((booking) => (
                      <tr
                        key={booking.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="p-2">{booking.id.substring(0, 8)}...</td>
                        <td className="p-2">
                          <div>
                            <div className="font-medium">
                              {booking.customerName || "N/A"}
                            </div>
                            {booking.customerPhone && (
                              <div className="text-xs text-gray-500">
                                {booking.customerPhone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-2">
                          {formatDateTime(
                            booking.bookingDate,
                            booking.startTime
                          )}
                        </td>
                        <td className="p-2">
                          {formatCurrency(booking.totalPrice || 0)}
                        </td>
                        <td className="p-2">
                          {paymentLoading ? (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Đang tải...
                            </span>
                          ) : (
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                booking.status === "CONFIRMED"
                                  ? "bg-green-100 text-green-800"
                                  : booking.status === "PENDING"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : booking.status === "COMPLETED"
                                  ? "bg-blue-100 text-blue-800"
                                  : booking.status === "CANCELLED"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {booking.status === "CONFIRMED"
                                ? "Đã xác nhận"
                                : booking.status === "PENDING"
                                ? "Chờ xác nhận"
                                : booking.status === "COMPLETED"
                                ? "Hoàn thành"
                                : booking.status === "CANCELLED"
                                ? "Đã hủy"
                                : booking.status}
                            </span>
                          )}
                        </td>
                        <td className="p-2">
                          {paymentLoading ? (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Đang tải...
                            </span>
                          ) : (
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                paymentStatuses[booking.id] === "COMPLETED"
                                  ? "bg-green-100 text-green-800"
                                  : paymentStatuses[booking.id] === "UNPAID"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : paymentStatuses[booking.id] === "REFUNDED"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {paymentStatuses[booking.id] === "COMPLETED"
                                ? "Đã thanh toán"
                                : paymentStatuses[booking.id] === "UNPAID"
                                ? "Chưa thanh toán"
                                : paymentStatuses[booking.id] === "REFUNDED"
                                ? "Đã hoàn tiền"
                                : "Chưa thanh toán"}
                            </span>
                          )}
                        </td>
                        <td className="p-2">
                          {paymentLoading ? (
                            <span className="text-xs text-gray-500">
                              Đang tải...
                            </span>
                          ) : paymentStatuses[booking.id] !== "COMPLETED" &&
                            paymentStatuses[booking.id] !== "REFUNDED" ? (
                            <div className="flex space-x-2">
                              <span
                                className="px-3 py-1 bg-[var(--primary-color)] text-white text-xs rounded hover:bg-[var(--primary-color)]/80 flex items-center cursor-pointer"
                                onClick={() =>
                                  openVerificationModal(booking.id)
                                }
                                title="Nhập mã xác thực từ khách hàng"
                              >
                                <i className="fas fa-keyboard mr-1"></i> Xác
                                thực
                              </span>
                            </div>
                          ) : null}
                        </td>
                      </tr>
                    ))}
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
      )}

      {showVerificationModal && <VerificationModal />}
      {showQRModal && (
        <AdminPaymentQRCode
          bookingId={currentBookingId}
          onClose={closeQRModal}
        />
      )}
    </div>
  );
};

export default Transactions;
