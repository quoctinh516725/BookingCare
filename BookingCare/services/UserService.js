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

const getServices = async () => {
  const response = await axios.get(`/api/v1/services`, {
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });
  return response.data;
};

const getStaff = async () => {
  const response = await axios.get(`/api/v1/users/staff`, {
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });
  return response.data;
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
    console.log(`Checking booked slots for staff ${staffId} on ${date}`);
    
    // Sử dụng endpoint mới để tránh xung đột
    const url = `/api/v1/bookings/staff-booked-times?staffId=${staffId}&date=${date}`;
    console.log(`API call: GET ${url}`);
    
    // Sử dụng axios trực tiếp để đơn giản hóa
    const token = localStorage.getItem("access_token");
    const headers = token ? { Authorization: `Bearer ${JSON.parse(token)}` } : {};
    
    const response = await axios.get(url, { headers });
    console.log("API response success:", response.data);
    return response.data;
  } catch (error) {
    console.error("API call failed:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    return [];
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
  cancelBooking
};
