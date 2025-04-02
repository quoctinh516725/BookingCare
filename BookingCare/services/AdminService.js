import axios from "axios";

// Tạo instance của axios với cấu hình cơ bản
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
  headers: {
    "Content-Type": "application/json"
  }
});

// Hàm lấy JWT token từ localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
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
  }
};

export default AdminService; 