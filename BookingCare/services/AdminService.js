import axios from "axios";

// Tạo instance của axios với cấu hình cơ bản
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json"
  },
  withCredentials: true
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
      const response = await axiosInstance.get("/api/v1/users", {
        headers: getAuthHeader()
      });
      console.log("Fetched users:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
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
      
      console.log("Creating user with data:", requestData);
      
      const response = await axiosInstance.post("/api/v1/users", requestData, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
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
      
      console.log("Updating user with data:", requestData);
      
      const response = await axiosInstance.put(`/api/v1/users/${userId}`, requestData, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  /**
   * Xóa người dùng
   * @param {string} userId ID của người dùng cần xóa
   * @returns {Promise<void>}
   */
  deleteUser: async (userId) => {
    try {
      await axiosInstance.delete(`/api/v1/users/${userId}`, {
        headers: getAuthHeader()
      });
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
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
   * Tạo nhóm quyền mới
   * @param {Object} groupData Thông tin nhóm quyền mới
   * @returns {Promise<Object>} Thông tin nhóm quyền đã tạo
   */
  createPermissionGroup: async (groupData) => {
    try {
      const response = await axiosInstance.post("/api/v1/permissions/groups", groupData, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error("Error creating permission group:", error);
      throw error;
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
      const response = await axiosInstance.put(`/api/v1/permissions/groups/${groupId}`, groupData, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error("Error updating permission group:", error);
      throw error;
    }
  },

  /**
   * Xóa nhóm quyền
   * @param {string} groupId ID của nhóm quyền cần xóa
   * @returns {Promise<boolean>} Kết quả xóa
   */
  deletePermissionGroup: async (groupId) => {
    try {
      await axiosInstance.delete(`/api/v1/permissions/groups/${groupId}`, {
        headers: getAuthHeader()
      });
      return true;
    } catch (error) {
      console.error("Error deleting permission group:", error);
      throw error;
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