import axios from "axios";
import Cookies from "js-cookie";

// Get the API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

// Cấu hình mặc định cho axios
axios.defaults.withCredentials = true;
axios.defaults.baseURL = API_URL;
axios.defaults.timeout = 30000; // Default timeout to 30 seconds

const axiosJWT = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 30000 // Default timeout to 30 seconds
});

// Global variables for token refresh handling
let isRefreshing = false;
let failedQueue = [];
const MAX_RETRY_COUNT = 3;

// Process queued failed requests
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Thêm interceptor để tự động refresh token
axiosJWT.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Lưu request ban đầu để thử lại
    const originalRequest = error.config;
    
    // Nếu không có response hoặc không có originalRequest, không thể xử lý
    if (!error.response || !originalRequest) {
      console.error("Lỗi mạng hoặc không có request ban đầu:", error.message);
      
      // Thử lại request cho lỗi mạng (không có response)
      if (!error.response && !originalRequest._retryCount) {
        originalRequest._retryCount = 1;
        
        // Thực hiện thử lại với độ trễ tăng dần
        const retryDelay = Math.pow(2, originalRequest._retryCount) * 1000;
        console.log(`Thử lại request sau ${retryDelay}ms (lần ${originalRequest._retryCount}/${MAX_RETRY_COUNT})`);
        
        if (originalRequest._retryCount <= MAX_RETRY_COUNT) {
          return new Promise(resolve => {
            setTimeout(() => resolve(axiosJWT(originalRequest)), retryDelay);
          });
        }
      }
      
      return Promise.reject(error);
    }
    
    // Nếu lỗi 401 Unauthorized, thử refresh token và gửi lại request
    if (error.response.status === 401 && !originalRequest._retry) {
      console.log("Token hết hạn, đang thử refresh...");
      
      // Kiểm tra nếu đang refresh token
      if (isRefreshing) {
        console.log("Đang có refresh token khác đang xử lý, request hiện tại sẽ đợi");
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            console.log("Dùng token đã refresh để thử lại request");
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosJWT(originalRequest);
          })
          .catch(err => {
            console.error("Thử lại request với token mới thất bại:", err);
            return Promise.reject(err);
          });
      }
      
      // Thêm flag để tránh lặp vô hạn
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        // Gọi API refresh token
        console.log("Đang gọi API refresh token...");
        const refreshResponse = await refreshToken();
        
        if (refreshResponse && refreshResponse.token) {
          const newToken = refreshResponse.token;
          console.log("Token đã được refresh thành công");
          
          // Xử lý hàng đợi các request đang chờ
          processQueue(null, newToken);
          
          // Cập nhật token mới vào request ban đầu
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          
          // Kết thúc quá trình refresh
          isRefreshing = false;
          
          // Thử lại request ban đầu với token mới
          return axiosJWT(originalRequest);
        } else {
          console.error("API refresh token trả về không có token mới");
          processQueue(new Error("Không thể refresh token"));
          isRefreshing = false;
          
          // Xóa token cũ
          localStorage.removeItem("access_token");
          
          // Chuyển hướng về trang login
          window.location.href = "/login";
          
          return Promise.reject(new Error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại"));
        }
      } catch (refreshError) {
        console.error("Lỗi khi refresh token:", refreshError);
        
        // Xử lý thông báo lỗi
        processQueue(refreshError);
        isRefreshing = false;
        
        // Xóa token cũ vì không còn hợp lệ
        localStorage.removeItem("access_token");
        
        // Log chi tiết về lỗi refresh token
        const errorDetails = {
          message: refreshError.message,
          response: refreshError.response?.data,
          status: refreshError.response?.status,
          time: new Date().toISOString()
        };
        console.error("Chi tiết lỗi refresh token:", errorDetails);
        
        // Chuyển hướng về trang login
        window.location.href = "/login";
        
        return Promise.reject(refreshError);
      }
    }
    
    // Xử lý các loại lỗi HTTP khác
    if (error.response) {
      const { status, data } = error.response;
      
      // Tạo thông tin lỗi chi tiết để log
      const errorContext = {
        url: originalRequest.url,
        method: originalRequest.method,
        status,
        data,
        timestamp: new Date().toISOString()
      };
      
      switch (status) {
        case 403:
          console.error("Lỗi quyền truy cập (403):", errorContext);
          break;
          
        case 404:
          console.error("Tài nguyên không tồn tại (404):", errorContext);
          break;
          
        case 400:
          console.error("Yêu cầu không hợp lệ (400):", errorContext);
          break;
          
        case 500:
        case 502:
        case 503:
        case 504:
          console.error(`Lỗi máy chủ (${status}):`, errorContext);
          
          // Thử lại request cho lỗi máy chủ
          if (!originalRequest._serverErrorRetryCount) {
            originalRequest._serverErrorRetryCount = 1;
          } else {
            originalRequest._serverErrorRetryCount++;
          }
          
          // Giới hạn số lần thử lại
          if (originalRequest._serverErrorRetryCount <= 2) {
            const retryDelay = originalRequest._serverErrorRetryCount * 1000;
            console.log(`Thử lại request sau lỗi máy chủ sau ${retryDelay}ms (lần ${originalRequest._serverErrorRetryCount}/2)`);
            
            return new Promise(resolve => {
              setTimeout(() => resolve(axiosJWT(originalRequest)), retryDelay);
            });
          }
          break;
          
        default:
          console.error(`Lỗi HTTP không xử lý (${status}):`, errorContext);
      }
    }
    
    // Trả về lỗi nếu không thể xử lý
    return Promise.reject(error);
  }
);

// Request interceptor để thêm token và xử lý request
axiosJWT.interceptors.request.use(function (config) {
  // Đảm bảo tất cả request đều có timeout
  if (!config.timeout) {
    config.timeout = 30000; // Default 30s
  }
  
  // Đảm bảo tất cả request đều có withCredentials
  config.withCredentials = true;
  
  // Thêm timestamp để tránh cache
  if (config.method === 'get') {
    if (!config.params) {
      config.params = {};
    }
    config.params._t = new Date().getTime();
  }
  
  // Thêm token vào request nếu chưa có
  if (!config.headers.Authorization) {
    const tokenString = localStorage.getItem("access_token");
    if (tokenString) {
      try {
        const token = JSON.parse(tokenString);
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error("Error parsing token for request:", error);
      }
    }
  }
  
  return config;
}, function (error) {
  return Promise.reject(error);
});

const signUpUser = async (data) => {
  try {
    // Đảm bảo role là CUSTOMER nếu không được chỉ định
    const userData = {
      ...data,
      role: data.role || "CUSTOMER" // Mặc định là CUSTOMER nếu không chỉ định
    };
    
    console.log("Signing up user with data:", userData);
    
    const response = await axios.post(`/api/v1/auth/register`, userData, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    
    // Lưu thông tin về vai trò người dùng nếu có
    if (response.data && response.data.user && response.data.user.role) {
      localStorage.setItem("user_role", response.data.user.role);
      console.log(`User role set: ${response.data.user.role}`);
    }
    
    return response.data;
  } catch (error) {
    console.error("Registration error:", error);
    // Xử lý lỗi đăng ký cụ thể
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
      
      // Nếu lỗi là do email hoặc username đã tồn tại
      if (error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      }
    }
    throw error;
  }
};

const loginUser = async (data) => {
  try {
    const response = await axios.post(`/api/v1/auth/login`, data, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    
    // Lưu thông tin về vai trò người dùng nếu có
    if (response.data && response.data.user && response.data.user.role) {
      localStorage.setItem("user_role", response.data.user.role);
      console.log(`User role set: ${response.data.user.role}`);
    }
    
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

const getDetailUser = async (id, token) => {
  try {
    console.log(`Getting details for user ID: ${id}`);
    
    // Nếu không có token, lấy từ localStorage
    if (!token) {
      const tokenString = localStorage.getItem("access_token");
      token = tokenString ? JSON.parse(tokenString) : null;
      
      if (!token) {
        console.warn("No token provided and none found in localStorage");
      }
    }
    
    // Chuẩn bị headers
    const headers = {
      "Content-Type": "application/json",
    };
    
    // Thêm authorization header nếu có token
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    try {
      const response = await axiosJWT.get(`/api/v1/users/${id}`, {
        headers: headers,
        withCredentials: true,
      });

      // Lưu thông tin về vai trò người dùng nếu có
      if (response.data && response.data.role) {
        localStorage.setItem("user_role", response.data.role);
        console.log(`User role updated: ${response.data.role}`);
      }

      return response.data;
    } catch (apiError) {
      // Xử lý lỗi 403 (Forbidden)
      if (apiError.response && apiError.response.status === 403) {
        console.log("Forbidden: Insufficient permissions to access user details");
        
        // Thử phương án khác: Sử dụng API profile thay vì user detail API
        try {
          console.log("Attempting to fetch user profile instead...");
          const profileResponse = await getUserProfile(token);
          if (profileResponse && profileResponse.id === id) {
            return profileResponse;
          } else {
            console.warn("Profile ID doesn't match requested user ID");
          }
        } catch (profileError) {
          console.error("Failed to fetch profile as fallback:", profileError);
        }
      }
      
      // Xử lý lỗi xác thực
      if (apiError.response && apiError.response.status === 401) {
        console.log("Unauthorized access - token may be invalid");
        // Thử refresh token nếu lỗi 401
        try {
          const refreshResponse = await refreshToken();
          if (refreshResponse && refreshResponse.token) {
            // Thử lại với token mới
            return getDetailUser(id, refreshResponse.token);
          }
        } catch (refreshError) {
          console.error("Failed to refresh token:", refreshError);
        }
      }
      
      throw apiError;
    }
  } catch (e) {
    console.error("Error in getDetailUser:", e);
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
      
      // Lưu thông tin vai trò người dùng nếu có
      if (response.data.role) {
        localStorage.setItem("user_role", response.data.role);
        console.log(`User role set: ${response.data.role}`);
      }
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
      localStorage.removeItem("user_role");
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
 * @param {string} categoryId ID của danh mục (tùy chọn) để lọc theo danh mục
 * @returns {Promise<Array>} Danh sách dịch vụ
 */
const getServices = async (categoryId = null) => {
  try {
    const url = categoryId 
      ? `/api/v1/services?categoryId=${categoryId}` 
      : `/api/v1/services`;
      
    const response = await axios.get(url, {
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

/**
 * Tạo dịch vụ mới
 * @param {Object} serviceData Dữ liệu dịch vụ cần tạo
 * @returns {Promise<Object>} Thông tin dịch vụ đã tạo
 */
const createService = async (serviceData) => {
  const tokenString = localStorage.getItem("access_token");
  const token = tokenString ? JSON.parse(tokenString) : null;
  
  try {
    const response = await axiosJWT.post(`/api/v1/services`, serviceData, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      },
      withCredentials: true,
    });
    
    return response.data;
  } catch (error) {
    console.error("Error creating service:", error);
    throw error;
  }
};

/**
 * Cập nhật thông tin dịch vụ
 * @param {string} id ID của dịch vụ
 * @param {Object} serviceData Dữ liệu dịch vụ cần cập nhật
 * @returns {Promise<Object>} Thông tin dịch vụ đã cập nhật
 */
const updateService = async (id, serviceData) => {
  const tokenString = localStorage.getItem("access_token");
  const token = tokenString ? JSON.parse(tokenString) : null;
  
  try {
    const response = await axiosJWT.put(`/api/v1/services/${id}`, serviceData, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      },
      withCredentials: true,
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error updating service with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Xóa dịch vụ
 * @param {string} id ID của dịch vụ cần xóa
 * @returns {Promise<void>}
 */
const deleteService = async (id) => {
  const tokenString = localStorage.getItem("access_token");
  const token = tokenString ? JSON.parse(tokenString) : null;
  
  try {
    await axiosJWT.delete(`/api/v1/services/${id}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      },
      withCredentials: true,
    });
  } catch (error) {
    console.error(`Error deleting service with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Upload ảnh lên server
 * @param {File} file File ảnh cần upload
 * @returns {Promise<string>} URL của ảnh đã upload
 */
const uploadImage = async (file) => {
  const tokenString = localStorage.getItem("access_token");
  const token = tokenString ? JSON.parse(tokenString) : null;
  
  // Tạo FormData để gửi file
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await axiosJWT.post('/api/v1/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      withCredentials: true,
    });
    
    return response.data.imageUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

/**
 * Lấy thông tin profile của người dùng hiện tại
 * API này thường có quyền truy cập ít hạn chế hơn so với getUserById
 * @param {string} token Access token
 * @returns {Promise<Object>} Thông tin người dùng
 */
const getUserProfile = async (token) => {
  try {
    // Nếu không có token, lấy từ localStorage
    if (!token) {
      const tokenString = localStorage.getItem("access_token");
      token = tokenString ? JSON.parse(tokenString) : null;
      
      if (!token) {
        console.warn("No token provided and none found in localStorage");
        throw new Error("Authentication required");
      }
    }
    
    // Chuẩn bị headers
    const headers = {
      "Content-Type": "application/json",
    };
    
    // Thêm authorization header nếu có token
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await axiosJWT.get(`/api/v1/auth/profile`, {
      headers: headers,
      withCredentials: true,
    });
    
    // Lưu thông tin về vai trò người dùng nếu có
    if (response.data && response.data.role) {
      localStorage.setItem("user_role", response.data.role);
      console.log(`User role updated from profile: ${response.data.role}`);
    }
    
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    
    // Xử lý lỗi xác thực
    if (error.response && error.response.status === 401) {
      try {
        const refreshResponse = await refreshToken();
        if (refreshResponse && refreshResponse.token) {
          // Thử lại với token mới
          return getUserProfile(refreshResponse.token);
        }
      } catch (refreshError) {
        console.error("Failed to refresh token:", refreshError);
      }
    }
    
    throw error;
  }
};

/**
 * Kiểm tra quyền của người dùng hiện tại
 * @returns {Promise<Object>} Thông tin quyền của người dùng
 */
const checkUserPermissions = async () => {
  try {
    const tokenString = localStorage.getItem("access_token");
    const token = tokenString ? JSON.parse(tokenString) : null;
    
    if (!token) {
      console.warn("No token found in localStorage");
      return { hasPermission: false, role: null };
    }
    
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    };
    
    const response = await axiosJWT.get(`/api/v1/auth/permissions`, {
      headers: headers,
      withCredentials: true,
    });
    
    // Cập nhật thông tin vai trò
    if (response.data && response.data.role) {
      localStorage.setItem("user_role", response.data.role);
    }
    
    return response.data;
  } catch (error) {
    console.error("Error checking user permissions:", error);
    
    // Nếu lỗi 401, thử refresh token
    if (error.response && error.response.status === 401) {
      try {
        await refreshToken();
        // Nếu refresh thành công, thử lại
        return checkUserPermissions();
      } catch (refreshError) {
        console.error("Failed to refresh token:", refreshError);
      }
    }
    
    return { hasPermission: false, role: null };
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
  getStaffById,
  createService,
  updateService,
  deleteService,
  uploadImage,
  getUserProfile,
  checkUserPermissions
};
