import UserService from './UserService';

// Sử dụng axiosJWT để có khả năng tự động refresh token
const axiosJWT = UserService.axiosJWT;

// Hàm lấy JWT token từ localStorage đã có sẵn trong axiosJWT interceptor
// nên không cần hàm getAuthHeader nữa

/**
 * Service quản lý các chuyên gia (specialists)
 */
const SpecialistService = {
  /**
   * Lấy danh sách tất cả các chuyên gia
   */
  getAllSpecialists: async () => {
    try {
      const tokenString = localStorage.getItem("access_token");
      const token = tokenString ? JSON.parse(tokenString) : null;
      
      const response = await axiosJWT.get(`/api/v1/specialists`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách chuyên gia:", error);
      throw error;
    }
  },

  /**
   * Lấy thông tin chi tiết của một chuyên gia
   */
  getSpecialistById: async (id) => {
    try {
      const tokenString = localStorage.getItem("access_token");
      const token = tokenString ? JSON.parse(tokenString) : null;
      
      const response = await axiosJWT.get(`/api/v1/specialists/${id}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin chuyên gia ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Lấy thông tin chuyên gia theo userId
   */
  getSpecialistByUserId: async (userId) => {
    try {
      const tokenString = localStorage.getItem("access_token");
      const token = tokenString ? JSON.parse(tokenString) : null;
      
      const response = await axiosJWT.get(`/api/v1/specialists/user/${userId}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin chuyên gia theo userId ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Tạo mới một chuyên gia
   */
  createSpecialist: async (specialistData) => {
    try {
      // Đảm bảo có userId trong data
      if (!specialistData.userId) {
        throw new Error("Dữ liệu chuyên gia phải chứa userId");
      }
      
      const tokenString = localStorage.getItem("access_token");
      const token = tokenString ? JSON.parse(tokenString) : null;
      
      const response = await axiosJWT.post(`/api/v1/specialists`, specialistData, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo chuyên gia mới:", error);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin chuyên gia
   */
  updateSpecialist: async (id, specialistData) => {
    try {
      const tokenString = localStorage.getItem("access_token");
      const token = tokenString ? JSON.parse(tokenString) : null;
      
      const response = await axiosJWT.put(`/api/v1/specialists/${id}`, specialistData, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật thông tin chuyên gia ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Xóa một chuyên gia
   */
  deleteSpecialist: async (id) => {
    try {
      const tokenString = localStorage.getItem("access_token");
      const token = tokenString ? JSON.parse(tokenString) : null;
      
      const response = await axiosJWT.delete(`/api/v1/specialists/${id}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi xóa chuyên gia ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Tìm kiếm chuyên gia theo từ khóa
   */
  searchSpecialists: async (query) => {
    try {
      const tokenString = localStorage.getItem("access_token");
      const token = tokenString ? JSON.parse(tokenString) : null;
      
      const response = await axiosJWT.get(`/api/v1/specialists/search`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        withCredentials: true,
        params: { query }
      });
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi tìm kiếm chuyên gia với query "${query}":`, error);
      throw error;
    }
  },

  /**
   * Lấy danh sách chuyên gia theo chuyên môn
   */
  getSpecialistsBySpecialty: async (specialty) => {
    try {
      const tokenString = localStorage.getItem("access_token");
      const token = tokenString ? JSON.parse(tokenString) : null;
      
      const response = await axiosJWT.get(`/api/v1/specialists/specialty/${specialty}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy chuyên gia theo chuyên môn ${specialty}:`, error);
      throw error;
    }
  },

  /**
   * Lấy danh sách chuyên gia theo trạng thái
   */
  getSpecialistsByStatus: async (status) => {
    try {
      const tokenString = localStorage.getItem("access_token");
      const token = tokenString ? JSON.parse(tokenString) : null;
      
      const response = await axiosJWT.get(`/api/v1/specialists/status/${status}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy chuyên gia theo trạng thái ${status}:`, error);
      throw error;
    }
  },

  /**
   * Lấy danh sách chuyên gia xếp hạng cao nhất
   */
  getTopRatedSpecialists: async (limit = 5) => {
    try {
      const tokenString = localStorage.getItem("access_token");
      const token = tokenString ? JSON.parse(tokenString) : null;
      
      const response = await axiosJWT.get(`/api/v1/specialists/top-rated`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        withCredentials: true,
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy danh sách top ${limit} chuyên gia:`, error);
      throw error;
    }
  },

  /**
   * Kiểm tra một user có phải là chuyên gia không
   */
  isUserSpecialist: async (userId) => {
    try {
      const tokenString = localStorage.getItem("access_token");
      const token = tokenString ? JSON.parse(tokenString) : null;
      
      const response = await axiosJWT.get(`/api/v1/specialists/check/${userId}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi kiểm tra user ${userId} có phải là chuyên gia không:`, error);
      throw error;
    }
  },

  /**
   * Upload ảnh đại diện cho chuyên gia
   */
  uploadAvatar: async (specialistId, file) => {
    try {
      const tokenString = localStorage.getItem("access_token");
      const token = tokenString ? JSON.parse(tokenString) : null;
      
      const formData = new FormData();
      formData.append("file", file);
      
      if (specialistId) {
        formData.append("specialistId", specialistId);
      }

      const response = await axiosJWT.post(
        `/api/v1/specialists/upload-avatar`,
        formData,
        {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
            "Content-Type": "multipart/form-data"
          },
          withCredentials: true,
        }
      );

      return response.data.fileUrl;
    } catch (error) {
      console.error("Lỗi khi upload ảnh đại diện:", error);
      throw error;
    }
  },

  /**
   * Upload ảnh bổ sung cho chuyên gia
   */
  uploadImage: async (specialistId, file) => {
    try {
      const tokenString = localStorage.getItem("access_token");
      const token = tokenString ? JSON.parse(tokenString) : null;
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("specialistId", specialistId);

      const response = await axiosJWT.post(
        `/api/v1/specialists/upload-image`,
        formData,
        {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
            "Content-Type": "multipart/form-data"
          },
          withCredentials: true,
        }
      );

      return response.data.fileUrl;
    } catch (error) {
      console.error("Lỗi khi upload ảnh bổ sung:", error);
      throw error;
    }
  },

  /**
   * Xóa ảnh của chuyên gia
   */
  deleteImage: async (specialistId, imageUrl) => {
    try {
      const tokenString = localStorage.getItem("access_token");
      const token = tokenString ? JSON.parse(tokenString) : null;
      
      const response = await axiosJWT.delete(
        `/api/v1/specialists/images/${specialistId}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` })
          },
          withCredentials: true,
          params: { imageUrl }
        }
      );

      return response.data;
    } catch (error) {
      console.error("Lỗi khi xóa ảnh:", error);
      throw error;
    }
  },

  /**
   * Lấy danh sách các chuyên môn của chuyên gia
   * @returns {Promise<Array>} Danh sách chuyên môn
   */
  getSpecialistSpecialties: async () => {
    try {
      const tokenString = localStorage.getItem("access_token");
      const token = tokenString ? JSON.parse(tokenString) : null;
      
      // Thử gọi API để lấy danh sách chuyên môn
      try {
        const response = await axiosJWT.get(`/api/v1/specialists/specialties`, {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` })
          },
          withCredentials: true,
        });
        return response.data || [];
      } catch (apiError) {
        console.error("Lỗi khi gọi API danh sách chuyên môn:", apiError);
        
        // Nếu API không tồn tại hoặc có lỗi, trả về danh sách mẫu
        console.warn("Sử dụng danh sách chuyên môn mẫu");
        return [
          { id: 1, name: "Bác sĩ da liễu" },
          { id: 2, name: "Chuyên gia điều trị mụn" },
          { id: 3, name: "Chuyên gia trị liệu" },
          { id: 4, name: "Chuyên gia chăm sóc da" },
          { id: 5, name: "Chuyên gia trẻ hóa da" }
        ];
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách chuyên môn:", error);
      return [];
    }
  }
};

export default SpecialistService; 