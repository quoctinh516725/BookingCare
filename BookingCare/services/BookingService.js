import UserService from './UserService';

// Use axiosJWT from UserService for requests that need automatic token refreshing
const axiosJWT = UserService.axiosJWT;

// Helper function to get access token
const getAccessToken = () => {
  const tokenString = localStorage.getItem("access_token");
  return tokenString ? JSON.parse(tokenString) : null;
};

/**
 * Hàm trợ giúp ghi log lỗi API
 * @param {string} functionName Tên hàm gọi API
 * @param {Error} error Đối tượng lỗi
 * @param {Object} additionalInfo Thông tin bổ sung
 */
const logApiError = (functionName, error, additionalInfo = {}) => {
  // Tạo object thông tin lỗi để logging
  const errorInfo = {
    function: functionName,
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
    time: new Date().toISOString(),
    ...additionalInfo
  };

  console.error(`Error in ${functionName}:`, errorInfo);
};

/**
 * Formats serviceIds to ensure they are in the correct format for the backend
 * @param {Array|String} serviceIds - Service IDs that could be a single ID, array of IDs, or already formatted
 * @returns {Array} Array of service IDs as strings
 */
const formatServiceIds = (serviceIds) => {
  if (!serviceIds) return [];
  
  // If it's a string, convert to array
  if (typeof serviceIds === 'string') {
    return [serviceIds];
  }
  
  // If it's already an array, ensure all elements are strings (UUID format)
  if (Array.isArray(serviceIds)) {
    // Make sure each ID is properly formatted as a string
    return serviceIds.map(id => String(id).replace(/[^a-zA-Z0-9-]/g, '')); 
  }
  
  // Fallback
  return Array.isArray(serviceIds) ? serviceIds : [serviceIds];
};

/**
 * Debugging helper to validate booking data before sending to API
 * @param {Object} bookingData - Booking data to validate
 * @returns {Object} Validation result with potential errors
 */
const validateBookingData = (bookingData) => {
  const errors = [];
  
  // Check required fields
  if (!bookingData.customerId) errors.push("Missing customerId");
  if (!bookingData.serviceIds || (Array.isArray(bookingData.serviceIds) && bookingData.serviceIds.length === 0)) {
    errors.push("Missing serviceIds");
  }
  if (!bookingData.bookingDate) errors.push("Missing bookingDate");
  if (!bookingData.startTime) errors.push("Missing startTime");
  
  // Check UUID formats
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (bookingData.customerId && !uuidPattern.test(bookingData.customerId)) {
    errors.push("Invalid customerId format");
  }
  
  if (bookingData.staffId && !uuidPattern.test(bookingData.staffId)) {
    errors.push("Invalid staffId format");
  }
  
  // Check service IDs format
  if (Array.isArray(bookingData.serviceIds)) {
    bookingData.serviceIds.forEach((id, index) => {
      if (!uuidPattern.test(id)) {
        errors.push(`Invalid serviceId format at index ${index}: ${id}`);
      }
    });
  }
  
  // Check date format (should be YYYY-MM-DD)
  if (bookingData.bookingDate) {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(bookingData.bookingDate)) {
      errors.push("Invalid bookingDate format (should be YYYY-MM-DD)");
    }
  }
  
  // Check time format (should be HH:MM)
  const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
  if (bookingData.startTime && !timePattern.test(bookingData.startTime)) {
    errors.push("Invalid startTime format (should be HH:MM)");
  }
  
  if (bookingData.endTime && !timePattern.test(bookingData.endTime)) {
    errors.push("Invalid endTime format (should be HH:MM)");
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

/**
 * Create a new booking
 * @param {Object} bookingData - Booking data
 * @returns {Promise} Promise with booking response or error
 */
const createBooking = async (bookingData) => {
  try {
    console.log("Creating booking with data:", bookingData);
    
    // Validate booking data
    const validation = validateBookingData(bookingData);
    if (!validation.isValid) {
      console.error("Booking validation failed:", validation.errors);
      return {
        success: false,
        error: `Dữ liệu đặt lịch không hợp lệ: ${validation.errors.join(", ")}`
      };
    }
    
    // Đảm bảo customerId luôn được đặt từ user đang đăng nhập nếu cần
    const userData = JSON.parse(localStorage.getItem("user_data") || "{}");
    if (!bookingData.customerId && userData.id) {
      bookingData.customerId = userData.id;
    }
    
    // Ensure serviceIds is properly formatted as a Set compatible with Java
    const formattedData = {
      ...bookingData,
      // Ensure serviceIds is properly formatted
      serviceIds: formatServiceIds(bookingData.serviceIds)
    };
    
    console.log("Formatted booking data:", formattedData);
    console.log("JSON stringified data:", JSON.stringify(formattedData));
    
    const response = await axiosJWT.post(
      '/api/v1/bookings',
      formattedData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAccessToken()}`
        }
      }
    );
    
    // Xử lý phản hồi dựa trên cấu trúc mới từ controller
    const responseData = response.data;
    
    if (responseData.success === false) {
      return {
        success: false,
        error: responseData.message || "Đặt lịch thất bại",
        reason: responseData.reason
      };
    }
    
    return {
      success: true,
      message: responseData.message || "Đặt lịch thành công!",
      data: responseData.data || responseData
    };
  } catch (error) {
    console.error("Error creating booking:", error);
    
    // Xử lý lỗi từ server
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;
      
      console.error(`Server error (${status}):`, errorData);
      
      // Phân tích thông báo lỗi
      let errorMessage = "Đặt lịch thất bại";
      let errorReason = errorData?.reason || "UNKNOWN_ERROR";
      
      if (errorData && errorData.message) {
        errorMessage = errorData.message;
      } else if (status === 409) {
        errorMessage = "Thời gian đã được đặt! Vui lòng chọn thời gian khác.";
        errorReason = "TIME_CONFLICT";
      } else if (status === 404) {
        errorMessage = "Không tìm thấy thông tin chuyên viên hoặc dịch vụ.";
        errorReason = "NOT_FOUND";
      } else if (status === 400) {
        errorMessage = "Dữ liệu đặt lịch không hợp lệ.";
        errorReason = "INVALID_DATA";
      }
      
      return {
        success: false,
        error: errorMessage,
        reason: errorReason,
        status: status
      };
    }
    
    // Lỗi mạng hoặc lỗi khác
    return {
      success: false,
      error: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.",
      reason: "NETWORK_ERROR"
    };
  }
};

/**
 * Lấy danh sách lịch hẹn của người dùng
 * @returns {Promise<Array>} Danh sách lịch hẹn
 */
const getUserBookings = async () => {
  const tokenString = localStorage.getItem("access_token");
  const token = tokenString ? JSON.parse(tokenString) : null;

  if (!token) {
    console.error("No token available for getUserBookings");
    return [];
  }

  try {
    const response = await axiosJWT.get("/api/v1/bookings/user", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      withCredentials: true,
    });

    return response.data || [];
  } catch (error) {
    logApiError('getUserBookings', error);
    return [];
  }
};

/**
 * Lấy thông tin chi tiết của một lịch hẹn
 * @param {string} id ID của lịch hẹn
 * @returns {Promise<Object>} Thông tin chi tiết lịch hẹn
 */
const getBookingById = async (id) => {
  const tokenString = localStorage.getItem("access_token");
  const token = tokenString ? JSON.parse(tokenString) : null;

  try {
    const response = await axiosJWT.get(`/api/v1/bookings/${id}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      },
      withCredentials: true,
    });

    return response.data;
  } catch (error) {
    logApiError('getBookingById', error, { bookingId: id });
    throw error;
  }
};

/**
 * Hủy lịch hẹn
 * @param {string} id ID của lịch hẹn cần hủy
 * @returns {Promise<Object>} Kết quả hủy lịch hẹn
 */
const cancelBooking = async (id) => {
  const tokenString = localStorage.getItem("access_token");
  const token = tokenString ? JSON.parse(tokenString) : null;

  if (!token) {
    console.error("No token available for cancelBooking");
    return { success: false, error: "Không có quyền truy cập" };
  }

  try {
    const response = await axiosJWT.put(`/api/v1/bookings/${id}/cancel`, {}, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      withCredentials: true,
    });

    return { success: true, data: response.data };
  } catch (error) {
    logApiError('cancelBooking', error, { bookingId: id });
    
    let errorMessage = "Đã xảy ra lỗi khi hủy lịch hẹn";
    
    if (error.response) {
      const responseMessage = error.response.data?.message || 
                             error.response.data?.error || 
                             error.response.data;
      
      if (typeof responseMessage === 'string') {
        errorMessage = responseMessage;
      }
      
      if (error.response.status === 403) {
        errorMessage = "Bạn không có quyền hủy lịch hẹn này";
      } else if (error.response.status === 404) {
        errorMessage = "Không tìm thấy lịch hẹn";
      } else if (error.response.status === 409) {
        errorMessage = "Không thể hủy lịch hẹn đã kết thúc hoặc đã hủy";
      }
    }
    
    return { success: false, error: errorMessage };
  }
};

/**
 * Cập nhật trạng thái của một lịch hẹn
 * @param {string} id ID của lịch hẹn
 * @param {string} status Trạng thái mới
 * @returns {Promise<Object>} Lịch hẹn đã được cập nhật
 */
const updateBookingStatus = async (id, status) => {
  const tokenString = localStorage.getItem("access_token");
  const token = tokenString ? JSON.parse(tokenString) : null;

  if (!token) {
    console.error("No token available for updateBookingStatus");
    return {
      success: false,
      error: "Authentication required"
    };
  }

  if (!id) {
    return {
      success: false,
      error: "Booking ID is required"
    };
  }

  if (!status) {
    return {
      success: false,
      error: "Status is required"
    };
  }

  try {
    // Using the same endpoint as AdminService for consistency
    const response = await axiosJWT.put(
      `/api/v1/bookings/${id}/status?status=${status}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        withCredentials: true,
      }
    );

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    logApiError('updateBookingStatus', error, { bookingId: id, newStatus: status });
    
    let errorMessage = "An error occurred while updating booking status";
    
    if (error.response) {
      const { status, data } = error.response;
      
      // Extract message from response data if available
      const responseMessage = data?.message || data?.error || data;
      
      // Custom error messages based on status code
      switch (status) {
        case 400:
          errorMessage = "Dữ liệu không hợp lệ";
          break;
        case 401:
          errorMessage = "Không có quyền truy cập";
          break;
        case 403:
          errorMessage = "Không đủ quyền hạn để cập nhật trạng thái";
          break;
        case 404:
          errorMessage = "Không tìm thấy lịch hẹn";
          break;
        case 409:
          errorMessage = "Không thể cập nhật trạng thái (xung đột)";
          break;
        case 500:
          errorMessage = "Lỗi máy chủ khi cập nhật trạng thái";
          break;
        default:
          errorMessage = `Lỗi HTTP ${status}`;
      }
      
      // Use response message if available
      if (responseMessage && typeof responseMessage === 'string') {
        errorMessage = responseMessage;
      }
    } else if (error.request) {
      errorMessage = "Không thể kết nối đến máy chủ, vui lòng kiểm tra kết nối mạng";
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Lấy danh sách lịch hẹn theo nhân viên và ngày
 * @param {string} specialistId ID của nhân viên
 * @param {string} date Ngày cần lấy lịch hẹn (YYYY-MM-DD)
 * @returns {Promise<Array>} Danh sách lịch hẹn
 */
const getBookingsBySpecialistAndDate = async (specialistId, date) => {
  const tokenString = localStorage.getItem("access_token");
  const token = tokenString ? JSON.parse(tokenString) : null;

  try {
    const response = await axiosJWT.get(`/api/v1/bookings/specialist/${specialistId}/date/${date}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      },
      withCredentials: true,
    });

    return response.data || [];
  } catch (error) {
    logApiError('getBookingsBySpecialistAndDate', error, { specialistId, date });
    return [];
  }
};

/**
 * Get recent bookings
 * @param {number} limit - Number of bookings to retrieve
 * @returns {Promise<Object>} - Response containing bookings
 */
const getRecentBookings = async (limit = 5) => {
  const accessToken = getAccessToken();
  
  if (!accessToken) {
    console.warn("BookingService.getRecentBookings: No access token available");
    return { success: false, message: "Bạn cần đăng nhập để xem lịch hẹn gần đây" };
  }
  
  try {
    // Thêm timestamp để tránh cache
    const timestamp = new Date().getTime();
    console.log(`[BookingService.getRecentBookings] Đang tải dữ liệu với limit=${limit}`);
    
    // Sử dụng phương án dự phòng làm phương án chính - lấy tất cả và lọc
    const allResponse = await axiosJWT.get(`/api/v1/bookings?_t=${timestamp}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    // Sắp xếp theo thời gian tạo mới nhất
    const sortedBookings = allResponse.data.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.appointmentTime);
      const dateB = new Date(b.createdAt || b.appointmentTime);
      return dateB - dateA;
    });
    
    // Giới hạn số lượng theo tham số limit
    const limitedBookings = sortedBookings.slice(0, limit);
    
    console.log(`[BookingService.getRecentBookings] Đã lấy ${limitedBookings.length} booking gần đây nhất`);
    
    return {
      success: true,
      data: limitedBookings
    };
  } catch (error) {
    logApiError('getRecentBookings', error, { limit });
    
    // Trả về một mảng trống thay vì lỗi để tránh ảnh hưởng đến giao diện người dùng
    return {
      success: true,
      message: "Không thể tải lịch hẹn gần đây, vui lòng thử lại sau",
      data: []
    };
  }
};

export const getAllBookings = async (status) => {
  try {
    // Get headers with access token
    const token = getAccessToken();

    if (!token) {
      console.warn("BookingService.getAllBookings: No access token available");
      return { 
        success: false, 
        message: "Bạn cần đăng nhập để xem danh sách đặt lịch",
        data: []
      };
    }
    
    // Thêm timestamp để tránh cache
    const timestamp = new Date().getTime();
    
    // Different endpoints based on status parameter
    let url;
    if (status) {
      url = `/api/v1/bookings/status?status=${status}&size=1000&_t=${timestamp}`;
    } else {
      url = `/api/v1/bookings?_t=${timestamp}`;
    }

    console.log(`[BookingService.getAllBookings] Đang tải dữ liệu${status ? ` với status=${status}` : ''}`);
    
    // Make the request with appropriate headers
    const response = await axiosJWT.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // Kiểm tra phản hồi
    if (!response.data || !Array.isArray(response.data)) {
      console.warn("[BookingService.getAllBookings] API trả về dữ liệu không đúng định dạng:", response.data);
      return {
        success: true,
        data: [],
        message: "Dữ liệu không hợp lệ hoặc không có booking nào"
      };
    }
    
    console.log(`[BookingService.getAllBookings] Đã lấy ${response.data.length} booking`);

    // Structure the response
    return {
      success: true,
      data: response.data,
      message: "Lấy danh sách đặt lịch thành công"
    };
  } catch (error) {
    logApiError('getAllBookings', error, { status });
    
    // Trả về một mảng trống thay vì thông báo lỗi để tránh làm gián đoạn giao diện người dùng
    return {
      success: true,
      message: "Không thể tải dữ liệu, vui lòng thử lại sau",
      data: []
    };
  }
};

/**
 * Lấy danh sách thời gian đã đặt cho một chuyên viên vào một ngày
 * @param {string} staffId - ID của chuyên viên
 * @param {string} date - Ngày cần kiểm tra (định dạng YYYY-MM-DD)
 * @returns {Promise<Array<string>>} - Danh sách các khung giờ đã được đặt
 */
const getBookedTimeSlots = async (staffId, date) => {
  if (!staffId || !date) {
    console.warn("getBookedTimeSlots: Thiếu staffId hoặc date");
    return [];
  }

  console.log(`Đang kiểm tra thời gian đã đặt cho chuyên viên ${staffId} vào ngày ${date}`);
  
  try {
    const tokenString = localStorage.getItem("access_token");
    const token = tokenString ? JSON.parse(tokenString) : null;

    const response = await axiosJWT.get(`/api/v1/bookings/staff-booked-times`, {
      params: { staffId, date },
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      }
    });

    if (response.data && Array.isArray(response.data)) {
      console.log(`Thời gian đã đặt: [${response.data.join(', ')}]`);
      return response.data;
    } else {
      console.warn("API trả về dữ liệu không đúng định dạng:", response.data);
      return [];
    }
  } catch (error) {
    console.error("Lỗi khi lấy thời gian đã đặt:", error);
    if (error.response) {
      console.error("Chi tiết lỗi:", error.response.status, error.response.data);
    }
    return [];
  }
};

export default {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  updateBookingStatus,
  getBookingsBySpecialistAndDate,
  getRecentBookings,
  getAllBookings,
  getBookedTimeSlots
}; 