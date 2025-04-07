import axios from "axios";
import Cookies from "js-cookie";

// Get the API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Cấu hình mặc định cho axios
axios.defaults.withCredentials = true;
axios.defaults.baseURL = API_URL;

const axiosJWT = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

const signUpUser = async (data) => {
  const response = await axios.post(`/api/v1/auth/register`, data, {
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });
  return response.data;
};

const loginUser = async (data) => {
  const response = await axios.post(`/api/v1/auth/login`, data, {
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });
  return response.data;
};

const getDetailUser = async (id, token) => {
  try {
    const response = await axiosJWT.get(`/api/v1/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });

    return response.data;
  } catch (e) {
    console.log("Error in getDetailUser:", e);
    throw e;
  }
};

const updateUserInfo = async (id, data, token) => {
  try {
    console.log("Updating user info with data:", data);
    const response = await axiosJWT.put(`/api/v1/users/${id}`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });

    console.log("Update user response:", response.data);
    return response.data;
  } catch (e) {
    console.error("Error in updateUserInfo:", e);
    throw e;
  }
};

const changePassword = async (id, data, token) => {
  try {
    const response = await axiosJWT.post(
      `/api/v1/users/${id}/change-password`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

    return response.data;
  } catch (e) {
    console.log("Error in changePassword:", e);
    throw e;
  }
};

const refreshToken = async () => {
  try {
    console.log("Refreshing token...");

    // Try to get the refresh token from cookies
    let refreshTokenValue = null;
    try {
      refreshTokenValue = Cookies.get("refresh_token");
      console.log(
        "Found refresh token in cookies:",
        refreshTokenValue ? "yes" : "no"
      );
    } catch (e) {
      console.error("Error reading cookies:", e);
    }

    const requestBody = {};
    if (!refreshTokenValue) {
      console.log("No refresh token in cookies, trying to use stored token...");
    }

    const response = await axios.post(
      `/api/v1/auth/refresh-token`,
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

    if (response.data && response.data.token) {
      console.log("Token refreshed successfully");
      // Lưu token mới vào localStorage
      localStorage.setItem("access_token", JSON.stringify(response.data.token));
    } else {
      console.warn("Token refresh response didn't contain expected token");
    }

    return response.data;
  } catch (e) {
    console.error("Error refreshing token:", e);
    // Xử lý lỗi cụ thể
    if (e.response && e.response.status === 401) {
      console.log("Unauthorized - clearing local storage");
      localStorage.removeItem("access_token");
      // Có thể chuyển hướng về trang login ở đây nếu cần
      window.location.href = "/login";
    }
    throw e;
  }
};

const logoutUser = async () => {
  const response = await axios.post(
    `/api/v1/auth/logout`,
    {},
    {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    }
  );
  return response.data;
};

/**
 * Xóa cache khung giờ đặt lịch
 */
const clearBookingCache = () => {
  console.log("Clearing booking time slots cache");
  timeSlotCache.data = {};
  timeSlotCache.date = null;
  timeSlotCache.timestamp = null;
};

const bookingUser = async (data) => {
  const tokenString = localStorage.getItem("access_token");
  const token = tokenString ? JSON.parse(tokenString) : null;
  
  try {
    console.log("Sending booking data:", data);
    const response = await axiosJWT.post(`/api/v1/bookings`, data, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      },
      withCredentials: true,
    });
    console.log("Booking successful:", response.data);
    // Xóa cache khi đặt lịch thành công
    clearBookingCache();
    return response.data;
  } catch (error) {
    console.error("Booking error:", error);
    
    // Xử lý lỗi xung đột lịch
    if (error.response && error.response.status === 409) {
      const errorMessage = error.response.data?.message || "Nhân viên đã có lịch trong khung giờ này";
      const errorReason = error.response.data?.reason || "STAFF_CONFLICT";
      
      throw {
        status: 409,
        message: errorMessage,
        reason: errorReason
      };
    }
    
    // Các lỗi khác
    throw error;
  }
};

const getUserBookings = async () => {
  const tokenString = localStorage.getItem("access_token");
  const token = tokenString ? JSON.parse(tokenString) : null;
  
  const response = await axiosJWT.get(`/api/v1/bookings/my-bookings`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` })
    },
    withCredentials: true,
  });
  return response.data;
};

/**
 * Lấy danh sách dịch vụ
 * @returns {Promise<Array>} Danh sách dịch vụ
 */
const getServices = async () => {
  try {
    const response = await axios.get(`/api/v1/services`, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    
    // Kiểm tra và xử lý dữ liệu trả về
    if (!response.data) {
      console.error("No data returned from getServices API");
      return [];
    }
    
    // Kiểm tra các trường dữ liệu quan trọng
    const validatedServices = Array.isArray(response.data) 
      ? response.data.map(service => ({
          ...service,
          id: service.id || null,
          name: service.name || "Dịch vụ chưa đặt tên",
          price: service.price || 0,
          duration: service.duration || 0,
        }))
      : [];
      
    return validatedServices;
  } catch (error) {
    console.error("Error in getServices:", error);
    return [];
  }
};

/**
 * Lấy danh sách chuyên viên
 * @returns {Promise<Array>} Danh sách chuyên viên
 */
const getStaff = async () => {
  try {
    const response = await axios.get(`/api/v1/users/staff`, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    
    // Kiểm tra và xử lý dữ liệu trả về
    if (!response.data) {
      console.error("No data returned from getStaff API");
      return [];
    }
    
    // Kiểm tra các trường dữ liệu quan trọng
    const validatedStaff = Array.isArray(response.data) 
      ? response.data.map(staff => ({
          ...staff,
          id: staff.id || null,
          firstName: staff.firstName || "",
          lastName: staff.lastName || "",
          description: staff.description || staff.expertise || "Chuyên gia",
        }))
      : [];
      
    return validatedStaff;
  } catch (error) {
    console.error("Error in getStaff:", error);
    return [];
  }
};

// Thêm các API services cho admin dashboard
const getAdminStats = async () => {
  const tokenString = localStorage.getItem("access_token");
  const token = tokenString ? JSON.parse(tokenString) : null;
  
  const response = await axiosJWT.get(`/api/v1/admin/stats`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` })
    },
    withCredentials: true,
  });
  return response.data;
};

const getRecentBookings = async (limit = 5) => {
  const tokenString = localStorage.getItem("access_token");
  const token = tokenString ? JSON.parse(tokenString) : null;
  
  const response = await axiosJWT.get(`/api/v1/bookings?limit=${limit}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` })
    },
    withCredentials: true,
  });
  return response.data;
};

const getPopularServices = async () => {
  const tokenString = localStorage.getItem("access_token");
  const token = tokenString ? JSON.parse(tokenString) : null;
  
  const response = await axiosJWT.get(`/api/v1/services/popular`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` })
    },
    withCredentials: true,
  });
  return response.data;
};

/**
 * Kiểm tra tính khả dụng của khung giờ - đơn giản hóa để tránh lỗi
 * @param {Object} data Dữ liệu khung giờ cần kiểm tra (staffId, bookingDate, startTime)
 * @returns {Promise<Object>} Kết quả kiểm tra khung giờ
 */
const checkTimeSlotAvailability = async (data) => {
  try {
    console.log("Checking time slot availability:", data);
    
    // Get token from localStorage
    const token = localStorage.getItem("access_token");
    const headers = {
      "Content-Type": "application/json"
    };
    
    // Add authorization header if token exists
    if (token) {
      headers.Authorization = `Bearer ${JSON.parse(token)}`;
    }
    
    const response = await axios.post('/api/v1/bookings/check-availability', data, { headers });
    console.log("Availability check response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Time slot availability check failed:", error.message);
    
    // Log more details about the error
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    
    return {
      available: false,
      reason: "ERROR",
      message: error.response?.data?.message || "Không thể kiểm tra trạng thái khung giờ"
    };
  }
};

/**
 * Lấy danh sách khung giờ đã đặt cho nhân viên trong ngày
 * @param {string} staffId ID của nhân viên
 * @param {string} date Ngày cần kiểm tra (YYYY-MM-DD)
 * @returns {Promise<Array>} Danh sách các khung giờ đã đặt
 */
const getBookedTimeSlots = async (staffId, date) => {
  try {
    const formattedDate = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    const response = await axiosJWT.get(`/api/v1/bookings/staff-booked-times?staffId=${staffId}&date=${formattedDate}`, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching booked time slots:", error);
    return [];
  }
};

// Cache cho API getAllStaffBookedTimeSlots
const timeSlotCache = {
  data: {},
  date: null,
  ttl: 5 * 60 * 1000 // 5 phút 
};

/**
 * Lấy tất cả các khung giờ đã đặt cho tất cả nhân viên trong một ngày
 * @param {Date} date Ngày cần kiểm tra
 * @returns {Promise<Object>} Map với key là ID nhân viên và value là danh sách khung giờ đã đặt
 */
const getAllStaffBookedTimeSlots = async (date) => {
  try {
    const formattedDate = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    
    // Kiểm tra cache
    const now = new Date().getTime();
    if (
      timeSlotCache.date === formattedDate &&
      timeSlotCache.timestamp && 
      (now - timeSlotCache.timestamp < timeSlotCache.ttl) &&
      Object.keys(timeSlotCache.data).length > 0
    ) {
      console.log("Using cached time slots for date:", formattedDate);
      return timeSlotCache.data;
    }
    
    console.log("Fetching all staff booked time slots for date:", formattedDate);
    const response = await axiosJWT.get(`/api/v1/bookings/all-staff-booked-times?date=${formattedDate}`, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    
    // Cập nhật cache
    timeSlotCache.data = response.data;
    timeSlotCache.date = formattedDate;
    timeSlotCache.timestamp = now;
    
    return response.data;
  } catch (error) {
    console.error("Error fetching all staff booked time slots:", error);
    
    // Nếu lỗi network nhưng có cache, sử dụng cache cũ
    if (
      timeSlotCache.date === date.toISOString().split('T')[0] &&
      Object.keys(timeSlotCache.data).length > 0
    ) {
      console.log("Network error, using cached data");
      return timeSlotCache.data;
    }
    
    return {};
  }
};

/**
 * Hủy lịch hẹn
 * @param {string} bookingId ID của lịch hẹn cần hủy
 * @returns {Promise<Object>} Kết quả hủy lịch hẹn
 */
const cancelBooking = async (bookingId) => {
  try {
    console.log(`Cancelling booking with ID: ${bookingId}`);
    
    // Get token from localStorage
    const token = localStorage.getItem("access_token");
    if (!token) {
      throw new Error("Không tìm thấy token xác thực");
    }
    
    const response = await axiosJWT.put(
      `/api/v1/bookings/${bookingId}/status?status=CANCELLED`, 
      {}, // empty body
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${JSON.parse(token)}`
        },
        withCredentials: true
      }
    );
    
    console.log("Booking cancelled successfully:", response.data);
    // Xóa cache khi hủy lịch thành công
    clearBookingCache();
    return response.data;
  } catch (error) {
    console.error("Error cancelling booking:", error);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    throw error;
  }
};

/**
 * Lấy danh sách các bài viết blog
 * @param {number} limit Số lượng bài viết tối đa cần lấy
 * @returns {Promise<Array>} Danh sách bài viết
 */
const getBlogPosts = async (limit = 10) => {
  try {
    const response = await axios.get(`/api/v1/blogs?limit=${limit}`, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    
    // Kiểm tra và xử lý dữ liệu trả về
    if (!response.data) {
      console.error("No data returned from getBlogPosts API");
      return [];
    }
    
    // Kiểm tra các trường dữ liệu quan trọng
    const validatedBlogs = Array.isArray(response.data) 
      ? response.data.map(blog => ({
          ...blog,
          id: blog.id || null,
          title: blog.title || "Bài viết chưa có tiêu đề",
          content: blog.content || "",
          excerpt: blog.excerpt || "",
        }))
      : [];
      
    return validatedBlogs;
  } catch (error) {
    console.error("Error in getBlogPosts:", error);
    return [];
  }
};

/**
 * Lấy chi tiết một bài viết blog
 * @param {string|number} id ID của bài viết
 * @returns {Promise<Object>} Chi tiết bài viết
 */
const getBlogPostById = async (id) => {
  // Validate ID
  if (id === undefined || id === null || id === '' || id === 'undefined') {
    console.error('Invalid blog ID:', id);
    throw new Error('ID bài viết không hợp lệ');
  }
  
  try {
    const response = await axios.get(`/api/v1/blogs/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    
    // Validate response data
    if (!response.data) {
      throw new Error('Không tìm thấy dữ liệu bài viết');
    }
    
    // Ensure all necessary fields are present
    const blogData = {
      ...response.data,
      id: response.data.id || id,
      title: response.data.title || "Bài viết chưa có tiêu đề",
      content: response.data.content || "",
      author: response.data.author || "Chưa có thông tin tác giả",
      createdAt: response.data.createdAt || new Date().toISOString()
    };
    
    return blogData;
  } catch (error) {
    console.error(`Error fetching blog post with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Lấy chi tiết một dịch vụ
 * @param {string|number} id ID của dịch vụ
 * @returns {Promise<Object>} Chi tiết dịch vụ
 */
const getServiceById = async (id) => {
  // Validate ID
  if (id === undefined || id === null || id === '' || id === 'undefined') {
    console.error('Invalid service ID:', id);
    throw new Error('ID dịch vụ không hợp lệ');
  }
  
  try {
    const response = await axios.get(`/api/v1/services/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    
    // Validate response data
    if (!response.data) {
      throw new Error('Không tìm thấy dữ liệu dịch vụ');
    }
    
    // Ensure all necessary fields are present
    const serviceData = {
      ...response.data,
      id: response.data.id || id,
      name: response.data.name || "Dịch vụ chưa có tên",
      description: response.data.description || "Chưa có mô tả",
      price: response.data.price || 0,
      duration: response.data.duration || 0
    };
    
    return serviceData;
  } catch (error) {
    console.error(`Error fetching service with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Lấy chi tiết thông tin của một chuyên viên
 * @param {string|number} id ID của chuyên viên
 * @returns {Promise<Object>} Chi tiết thông tin chuyên viên
 */
const getStaffById = async (id) => {
  // Validate ID
  if (id === undefined || id === null || id === '' || id === 'undefined') {
    console.error('Invalid staff ID:', id);
    throw new Error('ID chuyên viên không hợp lệ');
  }
  
  try {
    const response = await axios.get(`/api/v1/users/staff/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    
    // Validate response data
    if (!response.data) {
      throw new Error('Không tìm thấy dữ liệu chuyên viên');
    }
    
    // Ensure all necessary fields are present
    const staffData = {
      ...response.data,
      id: response.data.id || id,
      firstName: response.data.firstName || "",
      lastName: response.data.lastName || "",
      description: response.data.description || response.data.expertise || "Chuyên gia",
      experience: response.data.experience || "Đang cập nhật kinh nghiệm"
    };
    
    return staffData;
  } catch (error) {
    console.error(`Error fetching staff with ID ${id}:`, error);
    throw error;
  }
};

export default {
  signUpUser,
  loginUser,
  getDetailUser,
  bookingUser,
  getUserBookings,
  refreshToken,
  logoutUser,
  updateUserInfo,
  changePassword,
  getServices,
  getStaff,
  getAdminStats,
  getRecentBookings,
  getPopularServices,
  axiosJWT,
  checkTimeSlotAvailability,
  getBookedTimeSlots,
  cancelBooking,
  getAllStaffBookedTimeSlots,
  clearBookingCache,
  getBlogPosts,
  getBlogPostById,
  getServiceById,
  getStaffById
};
