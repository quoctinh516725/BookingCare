import { useState, useEffect, useCallback, useMemo } from "react";
import BookingService from "../../../../services/BookingService";
import PaymentService from "../../../../services/PaymentService";
import { toast } from "sonner";

/**
 * Custom hook để quản lý dữ liệu bookings và xử lý logic liên quan
 */
export default function useBookingsData() {
  // State cho danh sách bookings
  const [bookings, setBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [paymentStatuses, setPaymentStatuses] = useState({});
  
  // State cho loading và error
  const [isLoading, setIsLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State cho modal xác thực
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [verificationError, setVerificationError] = useState(null);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  
  // State cho filter và search
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllBookings, setShowAllBookings] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState("all");
  
  // State cho pagination
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch bookings và payment statuses khi component mount
  useEffect(() => {
    fetchBookings();
    fetchAllBookings();
  }, []);

  // Hàm lấy trạng thái thanh toán cho danh sách bookings
  const fetchPaymentStatuses = useCallback(async (bookingsToCheck) => {
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
      for (let i = 0; i < bookingsToCheck.length; i += BATCH_SIZE) {
        const batch = bookingsToCheck.slice(i, i + BATCH_SIZE);
        
        // Xử lý một batch
        const batchPromises = batch.map(booking => fetchWithRetry(booking.id));
        const batchResults = await Promise.all(batchPromises);
        
        // Cập nhật statuses từ kết quả
        batchResults.forEach(({ bookingId, status }) => {
          statuses[bookingId] = status;
        });
        
        // Nếu còn batch tiếp theo, chờ một chút để tránh quá tải server
        if (i + BATCH_SIZE < bookingsToCheck.length) {
          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
        }
      }
    } catch (err) {
      console.error("Error fetching payment statuses:", err);
      // Nếu có lỗi, gán mặc định tất cả là UNPAID
      bookingsToCheck.forEach((booking) => {
        statuses[booking.id] = "UNPAID";
      });
    } finally {
      setPaymentStatuses(prevStatuses => ({...prevStatuses, ...statuses}));
      setPaymentLoading(false);
    }
  }, []);

  // Lấy danh sách booking gần đây
  const fetchBookings = useCallback(async () => {
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
  }, [fetchPaymentStatuses]);

  // Lấy tất cả booking
  const fetchAllBookings = useCallback(async () => {
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
  }, [fetchPaymentStatuses]);

  // Mở modal xác thực thanh toán
  const openVerificationModal = useCallback(async (bookingId) => {
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
  }, []);

  // Mở modal hiển thị QR
  const openQRModal = useCallback((bookingId) => {
    setCurrentBookingId(bookingId);
    setShowQRModal(true);
  }, []);

  // Đóng modal QR
  const closeQRModal = useCallback(() => {
    setShowQRModal(false);
    setCurrentBookingId(null);
  }, []);

  // Xử lý xác thực thanh toán
  const handleVerificationSubmit = useCallback(async (e) => {
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
  }, [verificationCode, currentBookingId, showAllBookings, fetchBookings, fetchAllBookings]);

  // Đóng modal xác thực
  const closeVerificationModal = useCallback(() => {
    setShowVerificationModal(false);
    setCurrentBookingId(null);
    setVerificationCode("");
    setVerificationError(null);
    setCurrentBooking(null);
  }, []);

  // Xử lý tìm kiếm
  const handleSearch = useCallback((e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  }, []);

  // Xử lý thay đổi bộ lọc
  const handleFilterChange = useCallback((type, value) => {
    if (type === "status") {
      setFilterStatus(value);
    } else if (type === "paymentStatus") {
      setFilterPaymentStatus(value);
    }
    setCurrentPage(1); // Reset to first page on filter change
  }, []);

  // Chuyển đổi giữa xem tất cả và xem gần đây
  const toggleBookingsView = useCallback(() => {
    setShowAllBookings(prev => !prev);
    setCurrentPage(1); // Reset to first page when switching view
  }, []);

  // Lọc danh sách booking
  const getFilteredBookings = useCallback(() => {
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
  }, [showAllBookings, allBookings, bookings, filterStatus, filterPaymentStatus, paymentStatuses, searchQuery]);

  // Lấy dữ liệu phân trang
  const getPaginatedData = useCallback(() => {
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
  }, [getFilteredBookings, currentPage, pageSize]);

  // Xử lý thay đổi trang
  const handlePageChange = useCallback((page, newPageSize) => {
    setCurrentPage(page);
    if (newPageSize) {
      setPageSize(newPageSize);
    }
  }, []);

  // Xử lý thay đổi code xác thực
  const handleVerificationCodeChange = useCallback((e) => {
    setVerificationCode(e.target.value.toUpperCase());
  }, []);

  // Xử lý chuyển từ modal xác thực sang modal QR
  const handleViewQRFromVerification = useCallback(() => {
    closeVerificationModal();
    openQRModal(currentBookingId);
  }, [closeVerificationModal, openQRModal, currentBookingId]);

  // Lấy dữ liệu phân trang memoized
  const paginatedData = useMemo(() => getPaginatedData(), [getPaginatedData]);

  return {
    // Data state
    paginatedBookings: paginatedData.data,
    totalItems: paginatedData.totalItems,
    paymentStatuses,
    currentBooking,
    
    // Loading state
    isLoading: isLoading || (showAllBookings && bookingsLoading),
    paymentLoading,
    error,
    
    // Filter state
    searchQuery,
    filterStatus,
    filterPaymentStatus,
    showAllBookings,
    
    // Pagination state
    currentPage,
    pageSize,
    
    // Modal state
    showVerificationModal,
    verificationCode,
    verificationError,
    verifyingPayment,
    showQRModal,
    currentBookingId,
    
    // Actions
    fetchBookings,
    openVerificationModal,
    closeVerificationModal,
    handleVerificationSubmit,
    handleVerificationCodeChange,
    handleSearch,
    handleFilterChange,
    toggleBookingsView,
    handlePageChange,
    openQRModal,
    closeQRModal,
    handleViewQRFromVerification
  };
} 