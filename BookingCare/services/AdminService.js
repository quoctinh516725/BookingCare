import axios from "axios";

// Tạo instance của axios với cấu hình cơ bản
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json"
  },
  withCredentials: true,
  timeout: 30000 // Default timeout to 30 seconds
});

// Global flag để tránh nhiều yêu cầu refresh token đồng thời
let isRefreshing = false;
let failedQueue = [];

// Tổng thời gian thử lại cho các lỗi mạng
const TOTAL_RETRY_TIME_MS = 10000; // 10 seconds
const MAX_RETRY_COUNT = 3;

// Function xử lý hàng đợi các request bị lỗi
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

// Thêm interceptor để tự động xử lý token hết hạn
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
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
            setTimeout(() => resolve(axiosInstance(originalRequest)), retryDelay);
          });
        }
      }
      
      return Promise.reject(error);
    }
    
    // Kiểm tra nếu lỗi 401 (Unauthorized) và chưa thử refresh token
    if (error.response.status === 401 && !originalRequest._retry) {
      console.log("Token hết hạn hoặc không hợp lệ, đang thử refresh...");
      
      // Kiểm tra nếu đang refresh token
      if (isRefreshing) {
        console.log("Đang có refresh token khác đang xử lý, request hiện tại sẽ đợi");
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        // Gọi API refresh token
        console.log("Bắt đầu gọi API refresh token...");
        const response = await axios.post(
          `${axiosInstance.defaults.baseURL}/api/v1/auth/refresh-token`,
          {},
          { 
            withCredentials: true,
            timeout: 10000 // 10 giây timeout cho refresh token
          }
        );
        
        if (response.data && response.data.token) {
          console.log("Token đã được refresh thành công");
          
          // Lưu token mới
          const newToken = response.data.token;
          localStorage.setItem("access_token", JSON.stringify(newToken));
          
          // Cập nhật tất cả các request đang chờ
          processQueue(null, newToken);
          
          // Cập nhật Authorization header và thử lại request gốc
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          
          // Kết thúc quá trình refresh
          isRefreshing = false;
          
          // Kiểm tra nếu token mới có chứa thông tin vai trò
          try {
            const tokenObj = JSON.parse(atob(newToken.split('.')[1]));
            if (tokenObj && tokenObj.role) {
              localStorage.setItem("user_role", tokenObj.role);
            }
          } catch (e) {
            console.warn("Không thể đọc thông tin từ token:", e);
          }
          
          return axiosInstance(originalRequest);
        } else {
          console.error("API refresh token trả về không có token mới");
          processQueue(new Error("Token refresh failed"));
          isRefreshing = false;
          
          // Chuyển hướng về trang login
          console.log("Không thể refresh token, chuyển hướng đến trang đăng nhập");
          localStorage.removeItem("access_token");
          window.location.href = "/admin/login";
          return Promise.reject(error);
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
        if (window.location.pathname.startsWith('/admin')) {
          window.location.href = "/admin/login";
        } else {
          window.location.href = "/login";
        }
        
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
          // Có thể thêm xử lý đặc biệt cho lỗi quyền truy cập
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
              setTimeout(() => resolve(axiosInstance(originalRequest)), retryDelay);
            });
          }
          break;
          
        default:
          console.error(`Lỗi HTTP không xử lý (${status}):`, errorContext);
      }
    }
    
    return Promise.reject(error);
  }
);

// Request timeout interceptor
axiosInstance.interceptors.request.use(function (config) {
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
  
  // Luôn lấy token mới nhất từ localStorage
  const authHeader = getAuthHeader();
  if (authHeader.Authorization) {
    config.headers.Authorization = authHeader.Authorization;
  }
  
  return config;
}, function (error) {
  return Promise.reject(error);
});

// Hàm lấy JWT token từ localStorage
const getAuthHeader = () => {
  const tokenString = localStorage.getItem("access_token");
  if (!tokenString) return {};
  
  try {
    const token = JSON.parse(tokenString);
    return { Authorization: `Bearer ${token}` };
  } catch (error) {
    console.error("Error parsing token:", error);
    return {};
  }
};

// API service cho admin dashboard
const AdminService = {
  // Exposition of axios instance for direct use if needed
  axiosInstance,
  
  /**
   * Lấy thống kê tổng quan cho admin dashboard
   * @returns {Promise<Object>} Đối tượng chứa các thống kê
   */
  getAdminStats: async () => {
    try {
      const response = await axiosInstance.get("/api/v1/admin/stats", {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      // Trả về dữ liệu mặc định nếu có lỗi
      return {
        userCount: 0,
        userGrowth: 0,
        serviceCount: 0,
        serviceGrowth: 0,
        staffCount: 0,
        staffGrowth: 0,
        bookingCount: 0,
        bookingGrowth: 0,
        revenue: 0,
        revenueGrowth: 0
      };
    }
  },

  /**
   * Lấy danh sách lịch hẹn gần đây
   * @param {number} limit Số lượng lịch hẹn tối đa cần lấy
   * @returns {Promise<Array>} Danh sách lịch hẹn
   */
  getRecentBookings: async (limit = 5) => {
    try {
      const response = await axiosInstance.get(`/api/v1/admin/recent-bookings?limit=${limit}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching recent bookings:", error);
      // Trả về mảng rỗng nếu có lỗi
      return [];
    }
  },

  /**
   * Lấy danh sách dịch vụ phổ biến
   * @param {number} limit Số lượng dịch vụ tối đa cần lấy
   * @returns {Promise<Array>} Danh sách dịch vụ phổ biến
   */
  getPopularServices: async (limit = 5) => {
    try {
      const response = await axiosInstance.get(`/api/v1/admin/popular-services?limit=${limit}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching popular services:", error);
      // Trả về mảng rỗng nếu có lỗi
      return [];
    }
  },

  /**
   * Lấy tất cả các lịch hẹn, có thể lọc theo trạng thái
   * @param {string} status Trạng thái lịch hẹn để lọc (tùy chọn)
   * @returns {Promise<Array>} Danh sách lịch hẹn
   */
  getAllBookings: async (status = null) => {
    try {
      const url = status 
        ? `/api/v1/bookings/status?status=${status}` 
        : "/api/v1/bookings";
      
      const response = await axiosInstance.get(url, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching all bookings:", error);
      return [];
    }
  },

  /**
   * Cập nhật trạng thái của lịch hẹn
   * @param {string} id ID của lịch hẹn
   * @param {string} status Trạng thái mới
   * @returns {Promise<Object>} Lịch hẹn đã được cập nhật
   */
  updateBookingStatus: async (id, status) => {
    try {
      const response = await axiosInstance.put(`/api/v1/bookings/${id}/status?status=${status}`, {}, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error("Error updating booking status:", error);
      throw error;
    }
  },

  /**
   * Lấy danh sách tất cả người dùng
   * @returns {Promise<Array>} Danh sách người dùng
   */
  getAllUsers: async () => {
    try {
      const headers = getAuthHeader();
      console.log("Fetching all users with auth header:", headers);
      
      // Thêm timestamp để tránh cache
      const url = `/api/v1/users?_t=${new Date().getTime()}`;
      
      const response = await axiosInstance.get(url, {
        headers: headers
      });
      
      console.log(`Fetched ${response.data.length} users successfully`);
      return response.data;
    } catch (error) {
      // Tạo object thông tin lỗi để logging
      const errorInfo = {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        time: new Date().toISOString()
      };
      
      console.error("Error fetching users:", errorInfo);
      
      // Xử lý các loại lỗi cụ thể
      if (error.response) {
        // Lỗi từ phía server với response
        switch (error.response.status) {
          case 401:
            console.error("Lỗi xác thực: Token không hợp lệ hoặc đã hết hạn");
            // Xử lý được thực hiện bởi interceptor
            break;
          
          case 403:
            console.error("Lỗi phân quyền: Không có quyền xem danh sách người dùng");
            // Thông báo cho người dùng
            alert("Bạn không có quyền xem danh sách người dùng. Vui lòng liên hệ quản trị viên.");
            break;
            
          case 500:
            console.error("Lỗi máy chủ:", error.response.data);
            alert("Có lỗi xảy ra từ phía máy chủ. Vui lòng thử lại sau.");
            break;
            
          default:
            console.error(`Lỗi HTTP ${error.response.status}:`, error.response.data);
        }
      } else if (error.request) {
        // Lỗi network: không nhận được response
        console.error("Lỗi kết nối tới máy chủ:", error.request);
        alert("Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối và thử lại.");
      } else {
        // Lỗi khác
        console.error("Lỗi không xác định:", error.message);
      }
      
      return [];
    }
  },

  /**
   * Lấy danh sách người dùng theo vai trò
   * @param {string} role Vai trò của người dùng (ADMIN, STAFF, CUSTOMER)
   * @returns {Promise<Array>} Danh sách người dùng theo vai trò
   */
  getUsersByRole: async (role) => {
    try {
      const response = await axiosInstance.get(`/api/v1/users/${role.toLowerCase()}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${role} users:`, error);
      return [];
    }
  },

  /**
   * Tạo người dùng mới
   * @param {Object} userData Thông tin người dùng mới
   * @returns {Promise<Object>} Thông tin người dùng đã tạo
   */
  createUser: async (userData) => {
    try {
      // Kiểm tra dữ liệu đầu vào
      if (!userData) {
        throw new Error("Dữ liệu người dùng không được để trống");
      }
      
      const requiredFields = ['email', 'password', 'firstName', 'lastName', 'phone', 'role'];
      const missingFields = requiredFields.filter(field => !userData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Thiếu các trường bắt buộc: ${missingFields.join(', ')}`);
      }
      
      // Đảm bảo dữ liệu phù hợp với UserRequest DTO trong backend
      const requestData = {
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone, // Backend mong đợi 'phone', không phải 'phoneNumber'
        role: userData.role,
        description: userData.description || ""
      };
      
      // Chắc chắn rằng có username, tạo từ email nếu không được cung cấp
      if (!userData.username || userData.username.trim() === "") {
        requestData.username = userData.email.split('@')[0]; // Tạo username từ phần trước @ của email
      } else {
        requestData.username = userData.username;
      }
      
      // Log dữ liệu request trước khi gửi đi (ẩn mật khẩu cho bảo mật)
      const logData = { ...requestData };
      if (logData.password) {
        logData.password = '********';
      }
      console.log("Creating user with data:", logData);
      
      // Thêm timeout để tránh request treo quá lâu
      const response = await axiosInstance.post("/api/v1/users", requestData, {
        headers: getAuthHeader(),
        timeout: 15000 // 15 giây timeout
      });
      
      console.log("User created successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating user:", error);
      
      // Chuẩn bị thông tin lỗi chi tiết
      let errorMessage = "Không thể tạo người dùng";
      let errorDetail = {};
      
      if (error.response) {
        // Lỗi từ server với response
        const { status, data } = error.response;
        errorDetail = {
          status,
          data,
          message: error.message,
          timestamp: new Date().toISOString()
        };
        
        // Xử lý các mã lỗi cụ thể
        switch (status) {
          case 400:
            errorMessage = "Dữ liệu không hợp lệ";
            break;
          case 401:
            errorMessage = "Không có quyền truy cập";
            break;
          case 403:
            errorMessage = "Không đủ quyền hạn để tạo người dùng";
            break;
          case 409:
            errorMessage = "Email hoặc tên đăng nhập đã tồn tại";
            break;
          case 500:
            errorMessage = "Lỗi máy chủ khi tạo người dùng";
            break;
          default:
            errorMessage = `Lỗi HTTP ${status}`;
        }
        
        // Thêm thông tin chi tiết từ response
        if (data) {
          if (data.message) {
            errorMessage = data.message;
          } else if (data.error) {
            errorMessage = data.error;
          } else if (typeof data === 'string') {
            errorMessage = data;
          }
        }
      } else if (error.request) {
        // Lỗi mạng - không nhận được response
        errorDetail = {
          request: true,
          message: "Không thể kết nối đến máy chủ",
          timestamp: new Date().toISOString()
        };
        errorMessage = "Không thể kết nối đến máy chủ, vui lòng kiểm tra kết nối mạng";
      } else {
        // Lỗi khác
        errorDetail = {
          message: error.message,
          timestamp: new Date().toISOString()
        };
      }
      
      // Log thông tin lỗi chi tiết
      console.error("Detailed error in createUser:", errorDetail);
      
      // Tạo một đối tượng Error có thêm thông tin chi tiết
      const enhancedError = new Error(errorMessage);
      enhancedError.detail = errorDetail;
      
      // Truyền response từ lỗi gốc nếu có
      if (error.response) {
        enhancedError.response = error.response;
      }
      
      throw enhancedError;
    }
  },

  /**
   * Cập nhật thông tin người dùng
   * @param {string} userId ID của người dùng
   * @param {Object} userData Thông tin cập nhật
   * @returns {Promise<Object>} Thông tin người dùng đã cập nhật
   */
  updateUser: async (userId, userData) => {
    try {
      // Kiểm tra dữ liệu đầu vào
      if (!userId) {
        throw new Error("ID người dùng không được để trống");
      }
      
      if (!userData) {
        throw new Error("Dữ liệu người dùng không được để trống");
      }
      
      // Kiểm tra các trường bắt buộc
      const requiredFields = ['email', 'firstName', 'lastName', 'phone'];
      const missingFields = requiredFields.filter(field => !userData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Thiếu các trường bắt buộc: ${missingFields.join(', ')}`);
      }
      
      // Đảm bảo dữ liệu phù hợp với UserUpdateRequest DTO trong backend
      const requestData = {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone, // Backend mong đợi 'phone', không phải 'phoneNumber'
        description: userData.description || "",
        role: userData.role // Thêm trường role để cập nhật vai trò người dùng
      };
      
      // Chỉ thêm password nếu có
      if (userData.password && userData.password.trim() !== "") {
        requestData.password = userData.password;
      }
      
      // Log dữ liệu request (ẩn mật khẩu nếu có)
      const logData = { ...requestData };
      if (logData.password) {
        logData.password = '********';
      }
      console.log(`Updating user ${userId} with data:`, logData);
      
      // Thêm timeout để tránh request treo quá lâu
      const response = await axiosInstance.put(`/api/v1/users/${userId}`, requestData, {
        headers: getAuthHeader(),
        timeout: 15000 // 15 giây timeout
      });
      
      console.log("User updated successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating user:", error);
      
      // Chuẩn bị thông tin lỗi chi tiết
      let errorMessage = "Không thể cập nhật thông tin người dùng";
      let errorDetail = {};
      
      if (error.response) {
        // Lỗi từ server với response
        const { status, data } = error.response;
        errorDetail = {
          status,
          data,
          message: error.message,
          timestamp: new Date().toISOString()
        };
        
        // Xử lý các mã lỗi cụ thể
        switch (status) {
          case 400:
            errorMessage = "Dữ liệu không hợp lệ";
            break;
          case 401:
            errorMessage = "Không có quyền truy cập";
            break;
          case 403:
            errorMessage = "Không đủ quyền hạn để cập nhật thông tin";
            break;
          case 404:
            errorMessage = "Không tìm thấy người dùng";
            break;
          case 409:
            errorMessage = "Email hoặc tên đăng nhập đã tồn tại";
            break;
          case 500:
            errorMessage = "Lỗi máy chủ khi cập nhật thông tin";
            // Thêm thông tin chi tiết từ backend nếu có
            if (data && data.message) {
              errorMessage += `: ${data.message}`;
            } else if (data && data.error) {
              errorMessage += `: ${data.error}`;
            } else if (typeof data === 'string' && data.length < 100) {
              errorMessage += `: ${data}`;
            }
            break;
          default:
            errorMessage = `Lỗi HTTP ${status}`;
        }
        
        // Thêm thông tin chi tiết từ response
        if (data) {
          if (data.message) {
            errorMessage = data.message;
          } else if (data.error) {
            errorMessage = data.error;
          } else if (typeof data === 'string' && data.length < 100) {
            errorMessage = data;
          }
        }
      } else if (error.request) {
        // Lỗi mạng - không nhận được response
        errorDetail = {
          request: true,
          message: "Không thể kết nối đến máy chủ",
          timestamp: new Date().toISOString()
        };
        errorMessage = "Không thể kết nối đến máy chủ, vui lòng kiểm tra kết nối mạng";
      } else {
        // Lỗi khác
        errorDetail = {
          message: error.message,
          timestamp: new Date().toISOString()
        };
      }
      
      // Log thông tin lỗi chi tiết
      console.error("Detailed error in updateUser:", errorDetail);
      
      // Tạo một đối tượng Error có thêm thông tin chi tiết
      const enhancedError = new Error(errorMessage);
      enhancedError.detail = errorDetail;
      
      // Truyền response từ lỗi gốc nếu có
      if (error.response) {
        enhancedError.response = error.response;
      }
      
      throw enhancedError;
    }
  },

  /**
   * Xóa người dùng
   * @param {string} userId ID của người dùng cần xóa
   * @returns {Promise<void>}
   */
  deleteUser: async (userId) => {
    try {
      // Kiểm tra dữ liệu đầu vào
      if (!userId) {
        throw new Error("ID người dùng không được để trống");
      }
      
      console.log(`Deleting user with ID: ${userId}`);
      
      // Thêm timeout để tránh request treo quá lâu
      await axiosInstance.delete(`/api/v1/users/${userId}`, {
        headers: getAuthHeader(),
        timeout: 15000 // 15 giây timeout
      });
      
      console.log("User deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      
      // Chuẩn bị thông tin lỗi chi tiết
      let errorMessage = "Không thể xóa người dùng";
      let errorDetail = {};
      
      if (error.response) {
        // Lỗi từ server với response
        const { status, data } = error.response;
        errorDetail = {
          status,
          data,
          message: error.message,
          timestamp: new Date().toISOString()
        };
        
        // Xử lý các mã lỗi cụ thể
        switch (status) {
          case 400:
            errorMessage = "Yêu cầu không hợp lệ";
            break;
          case 401:
            errorMessage = "Không có quyền truy cập";
            break;
          case 403:
            errorMessage = "Không đủ quyền hạn để xóa người dùng";
            break;
          case 404:
            errorMessage = "Không tìm thấy người dùng";
            break;
          case 409:
            errorMessage = "Không thể xóa người dùng đang sử dụng hệ thống";
            break;
          case 500:
            errorMessage = "Lỗi máy chủ khi xóa người dùng";
            // Thêm thông tin chi tiết từ backend nếu có
            if (data && data.message) {
              errorMessage += `: ${data.message}`;
            } else if (data && data.error) {
              errorMessage += `: ${data.error}`;
            } else if (typeof data === 'string' && data.length < 100) {
              errorMessage += `: ${data}`;
            }
            break;
          default:
            errorMessage = `Lỗi HTTP ${status}`;
        }
        
        // Thêm thông tin chi tiết từ response
        if (data) {
          if (data.message) {
            errorMessage = data.message;
          } else if (data.error) {
            errorMessage = data.error;
          } else if (typeof data === 'string' && data.length < 100) {
            errorMessage = data;
          }
        }
      } else if (error.request) {
        // Lỗi mạng - không nhận được response
        errorDetail = {
          request: true,
          message: "Không thể kết nối đến máy chủ",
          timestamp: new Date().toISOString()
        };
        errorMessage = "Không thể kết nối đến máy chủ, vui lòng kiểm tra kết nối mạng";
      } else {
        // Lỗi khác
        errorDetail = {
          message: error.message,
          timestamp: new Date().toISOString()
        };
      }
      
      // Log thông tin lỗi chi tiết
      console.error("Detailed error in deleteUser:", errorDetail);
      
      // Tạo một đối tượng Error có thêm thông tin chi tiết
      const enhancedError = new Error(errorMessage);
      enhancedError.detail = errorDetail;
      
      // Truyền response từ lỗi gốc nếu có
      if (error.response) {
        enhancedError.response = error.response;
      }
      
      throw enhancedError;
    }
  },

  /**
   * Lấy danh sách tất cả các quyền
   * @returns {Promise<Array>} Danh sách quyền
   */
  getAllPermissions: async () => {
    try {
      const response = await axiosInstance.get("/api/v1/permissions", {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching permissions:", error);
      return [];
    }
  },

  /**
   * Lấy danh sách tất cả các nhóm quyền
   * @returns {Promise<Array>} Danh sách nhóm quyền
   */
  getAllPermissionGroups: async () => {
    try {
      const response = await axiosInstance.get("/api/v1/permissions/groups", {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching permission groups:", error);
      return [];
    }
  },

  /**
   * Lấy danh sách nhóm quyền của một người dùng
   * @param {string} userId ID của người dùng
   * @returns {Promise<Array>} Danh sách ID của các nhóm quyền
   */
  getUserPermissionGroups: async (userId) => {
    try {
      const response = await axiosInstance.get(`/api/v1/permissions/users/${userId}/groups`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching user permission groups:", error);
      return [];
    }
  },

  /**
   * Lấy danh sách nhóm quyền của tất cả người dùng
   * @returns {Promise<Object>} Map với key là ID người dùng và value là danh sách ID của các nhóm quyền
   */
  getAllUserPermissionGroups: async () => {
    try {
      const response = await axiosInstance.get(`/api/v1/permissions/users/all-permissions`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching all user permission groups:", error);
      return {};
    }
  },

  /**
   * Tạo nhóm quyền mới
   * @param {Object} groupData Thông tin nhóm quyền mới
   * @returns {Promise<Object>} Thông tin nhóm quyền đã tạo
   */
  createPermissionGroup: async (groupData) => {
    try {
      // Kiểm tra dữ liệu đầu vào
      if (!groupData) {
        throw new Error("Dữ liệu nhóm quyền không được để trống");
      }
      
      // Kiểm tra các trường bắt buộc
      const requiredFields = ['name'];
      const missingFields = requiredFields.filter(field => !groupData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Thiếu các trường bắt buộc: ${missingFields.join(', ')}`);
      }
      
      // Log dữ liệu request
      console.log("Creating permission group:", {
        name: groupData.name,
        description: groupData.description,
        permissionCount: groupData.permissions ? groupData.permissions.length : 0
      });
      
      // Thêm timeout để tránh request treo quá lâu
      const response = await axiosInstance.post("/api/v1/permissions/groups", groupData, {
        headers: getAuthHeader(),
        timeout: 15000 // 15 giây timeout
      });
      
      console.log("Permission group created successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating permission group:", error);
      
      // Chuẩn bị thông tin lỗi chi tiết
      let errorMessage = "Không thể tạo nhóm quyền";
      let errorDetail = {};
      
      if (error.response) {
        // Lỗi từ server với response
        const { status, data } = error.response;
        errorDetail = {
          status,
          data,
          message: error.message,
          timestamp: new Date().toISOString()
        };
        
        // Xử lý các mã lỗi cụ thể
        switch (status) {
          case 400:
            errorMessage = "Dữ liệu không hợp lệ";
            break;
          case 401:
            errorMessage = "Không có quyền truy cập";
            break;
          case 403:
            errorMessage = "Không đủ quyền hạn để tạo nhóm quyền";
            break;
          case 409:
            errorMessage = "Tên nhóm quyền đã tồn tại";
            break;
          case 500:
            errorMessage = "Lỗi máy chủ khi tạo nhóm quyền";
            // Thêm thông tin chi tiết từ backend nếu có
            if (data && data.message) {
              errorMessage += `: ${data.message}`;
            } else if (data && data.error) {
              errorMessage += `: ${data.error}`;
            } else if (typeof data === 'string' && data.length < 100) {
              errorMessage += `: ${data}`;
            }
            break;
          default:
            errorMessage = `Lỗi HTTP ${status}`;
        }
        
        // Thêm thông tin chi tiết từ response
        if (data) {
          if (data.message) {
            errorMessage = data.message;
          } else if (data.error) {
            errorMessage = data.error;
          } else if (typeof data === 'string' && data.length < 100) {
            errorMessage = data;
          }
        }
      } else if (error.request) {
        // Lỗi mạng - không nhận được response
        errorDetail = {
          request: true,
          message: "Không thể kết nối đến máy chủ",
          timestamp: new Date().toISOString()
        };
        errorMessage = "Không thể kết nối đến máy chủ, vui lòng kiểm tra kết nối mạng";
      } else {
        // Lỗi khác
        errorDetail = {
          message: error.message,
          timestamp: new Date().toISOString()
        };
      }
      
      // Log thông tin lỗi chi tiết
      console.error("Detailed error in createPermissionGroup:", errorDetail);
      
      // Tạo một đối tượng Error có thêm thông tin chi tiết
      const enhancedError = new Error(errorMessage);
      enhancedError.detail = errorDetail;
      
      // Truyền response từ lỗi gốc nếu có
      if (error.response) {
        enhancedError.response = error.response;
      }
      
      throw enhancedError;
    }
  },

  /**
   * Cập nhật nhóm quyền
   * @param {string} groupId ID của nhóm quyền
   * @param {Object} groupData Thông tin cập nhật
   * @returns {Promise<Object>} Thông tin nhóm quyền đã cập nhật
   */
  updatePermissionGroup: async (groupId, groupData) => {
    try {
      // Kiểm tra dữ liệu đầu vào
      if (!groupId) {
        throw new Error("ID nhóm quyền không được để trống");
      }
      
      if (!groupData) {
        throw new Error("Dữ liệu nhóm quyền không được để trống");
      }
      
      // Kiểm tra các trường bắt buộc
      const requiredFields = ['name'];
      const missingFields = requiredFields.filter(field => !groupData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Thiếu các trường bắt buộc: ${missingFields.join(', ')}`);
      }
      
      // Log dữ liệu request (bỏ thông tin nhạy cảm)
      console.log("Updating permission group:", {
        groupId,
        name: groupData.name,
        description: groupData.description,
        permissionCount: groupData.permissions ? groupData.permissions.length : 0
      });
      
      // Thêm timeout để tránh request treo quá lâu
      const response = await axiosInstance.put(`/api/v1/permissions/groups/${groupId}`, groupData, {
        headers: getAuthHeader(),
        timeout: 15000 // 15 giây timeout
      });
      
      console.log("Permission group updated successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating permission group:", error);
      
      // Chuẩn bị thông tin lỗi chi tiết
      let errorMessage = "Không thể cập nhật nhóm quyền";
      let errorDetail = {};
      
      if (error.response) {
        // Lỗi từ server với response
        const { status, data } = error.response;
        errorDetail = {
          status,
          data,
          message: error.message,
          timestamp: new Date().toISOString()
        };
        
        // Xử lý các mã lỗi cụ thể
        switch (status) {
          case 400:
            errorMessage = "Dữ liệu không hợp lệ";
            break;
          case 401:
            errorMessage = "Không có quyền truy cập";
            break;
          case 403:
            errorMessage = "Không đủ quyền hạn để cập nhật nhóm quyền";
            break;
          case 404:
            errorMessage = "Không tìm thấy nhóm quyền";
            break;
          case 409:
            errorMessage = "Tên nhóm quyền đã tồn tại";
            break;
          case 500:
            errorMessage = "Lỗi máy chủ khi cập nhật nhóm quyền";
            // Thêm thông tin chi tiết từ backend nếu có
            if (data && data.message) {
              errorMessage += `: ${data.message}`;
            } else if (data && data.error) {
              errorMessage += `: ${data.error}`;
            } else if (typeof data === 'string' && data.length < 100) {
              errorMessage += `: ${data}`;
            }
            break;
          default:
            errorMessage = `Lỗi HTTP ${status}`;
        }
        
        // Thêm thông tin chi tiết từ response
        if (data) {
          if (data.message) {
            errorMessage = data.message;
          } else if (data.error) {
            errorMessage = data.error;
          } else if (typeof data === 'string' && data.length < 100) {
            errorMessage = data;
          }
        }
      } else if (error.request) {
        // Lỗi mạng - không nhận được response
        errorDetail = {
          request: true,
          message: "Không thể kết nối đến máy chủ",
          timestamp: new Date().toISOString()
        };
        errorMessage = "Không thể kết nối đến máy chủ, vui lòng kiểm tra kết nối mạng";
      } else {
        // Lỗi khác
        errorDetail = {
          message: error.message,
          timestamp: new Date().toISOString()
        };
      }
      
      // Log thông tin lỗi chi tiết
      console.error("Detailed error in updatePermissionGroup:", errorDetail);
      
      // Tạo một đối tượng Error có thêm thông tin chi tiết
      const enhancedError = new Error(errorMessage);
      enhancedError.detail = errorDetail;
      
      // Truyền response từ lỗi gốc nếu có
      if (error.response) {
        enhancedError.response = error.response;
      }
      
      throw enhancedError;
    }
  },

  /**
   * Xóa nhóm quyền
   * @param {string} groupId ID của nhóm quyền cần xóa
   * @returns {Promise<boolean>} Kết quả xóa
   */
  deletePermissionGroup: async (groupId) => {
    try {
      // Kiểm tra dữ liệu đầu vào
      if (!groupId) {
        throw new Error("ID nhóm quyền không được để trống");
      }
      
      console.log(`Deleting permission group with ID: ${groupId}`);
      
      // Thêm timeout để tránh request treo quá lâu
      await axiosInstance.delete(`/api/v1/permissions/groups/${groupId}`, {
        headers: getAuthHeader(),
        timeout: 15000 // 15 giây timeout
      });
      
      console.log("Permission group deleted successfully");
      return true;
    } catch (error) {
      console.error("Error deleting permission group:", error);
      
      // Chuẩn bị thông tin lỗi chi tiết
      let errorMessage = "Không thể xóa nhóm quyền";
      let errorDetail = {};
      
      if (error.response) {
        // Lỗi từ server với response
        const { status, data } = error.response;
        errorDetail = {
          status,
          data,
          message: error.message,
          timestamp: new Date().toISOString()
        };
        
        // Xử lý các mã lỗi cụ thể
        switch (status) {
          case 400:
            errorMessage = "Yêu cầu không hợp lệ";
            break;
          case 401:
            errorMessage = "Không có quyền truy cập";
            break;
          case 403:
            errorMessage = "Không đủ quyền hạn để xóa nhóm quyền";
            break;
          case 404:
            errorMessage = "Không tìm thấy nhóm quyền";
            break;
          case 409:
            errorMessage = "Không thể xóa nhóm quyền đang được sử dụng";
            break;
          case 500:
            errorMessage = "Lỗi máy chủ khi xóa nhóm quyền";
            // Thêm thông tin chi tiết từ backend nếu có
            if (data && data.message) {
              errorMessage += `: ${data.message}`;
            } else if (data && data.error) {
              errorMessage += `: ${data.error}`;
            } else if (typeof data === 'string' && data.length < 100) {
              errorMessage += `: ${data}`;
            }
            break;
          default:
            errorMessage = `Lỗi HTTP ${status}`;
        }
        
        // Thêm thông tin chi tiết từ response
        if (data) {
          if (data.message) {
            errorMessage = data.message;
          } else if (data.error) {
            errorMessage = data.error;
          } else if (typeof data === 'string' && data.length < 100) {
            errorMessage = data;
          }
        }
      } else if (error.request) {
        // Lỗi mạng - không nhận được response
        errorDetail = {
          request: true,
          message: "Không thể kết nối đến máy chủ",
          timestamp: new Date().toISOString()
        };
        errorMessage = "Không thể kết nối đến máy chủ, vui lòng kiểm tra kết nối mạng";
      } else {
        // Lỗi khác
        errorDetail = {
          message: error.message,
          timestamp: new Date().toISOString()
        };
      }
      
      // Log thông tin lỗi chi tiết
      console.error("Detailed error in deletePermissionGroup:", errorDetail);
      
      // Tạo một đối tượng Error có thêm thông tin chi tiết
      const enhancedError = new Error(errorMessage);
      enhancedError.detail = errorDetail;
      
      // Truyền response từ lỗi gốc nếu có
      if (error.response) {
        enhancedError.response = error.response;
      }
      
      throw enhancedError;
    }
  },

  /**
   * Gán nhóm quyền cho người dùng
   * @param {string} userId ID của người dùng
   * @param {string} groupId ID của nhóm quyền
   * @returns {Promise<boolean>} Kết quả gán
   */
  assignPermissionGroupToUser: async (userId, groupId) => {
    try {
      await axiosInstance.post(`/api/v1/permissions/users/${userId}/groups/${groupId}`, {}, {
        headers: getAuthHeader()
      });
      return true;
    } catch (error) {
      console.error("Error assigning permission group to user:", error);
      throw error;
    }
  },

  /**
   * Gỡ bỏ nhóm quyền khỏi người dùng
   * @param {string} userId ID của người dùng
   * @param {string} groupId ID của nhóm quyền
   * @returns {Promise<boolean>} Kết quả gỡ bỏ
   */
  removePermissionGroupFromUser: async (userId, groupId) => {
    try {
      await axiosInstance.delete(`/api/v1/permissions/users/${userId}/groups/${groupId}`, {
        headers: getAuthHeader()
      });
      return true;
    } catch (error) {
      console.error("Error removing permission group from user:", error);
      throw error;
    }
  }
};

export default AdminService; 