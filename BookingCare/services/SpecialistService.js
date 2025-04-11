import axios from "axios";

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

/**
 * Service quản lý các chuyên gia (specialists)
 */
const SpecialistService = {
  /**
   * Lấy danh sách tất cả các chuyên gia
   */
  getAllSpecialists: async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/v1/specialists`, {
        headers: getAuthHeader()
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
      const response = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/v1/specialists/${id}`, {
        headers: getAuthHeader()
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
      const response = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/v1/specialists/user/${userId}`, {
        headers: getAuthHeader()
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
      
      const response = await axios.post(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/v1/specialists`, specialistData, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        }
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
      const response = await axios.put(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/v1/specialists/${id}`, specialistData, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        }
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
      const response = await axios.delete(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/v1/specialists/${id}`, {
        headers: getAuthHeader()
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
      const response = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/v1/specialists/search`, {
        headers: getAuthHeader(),
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
      const response = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/v1/specialists/specialty/${specialty}`, {
        headers: getAuthHeader()
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
      const response = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/v1/specialists/status/${status}`, {
        headers: getAuthHeader()
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
      const response = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/v1/specialists/top-rated`, {
        headers: getAuthHeader(),
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
      const response = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/v1/specialists/check/${userId}`, {
        headers: getAuthHeader()
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
      const formData = new FormData();
      formData.append("file", file);
      
      if (specialistId) {
        formData.append("specialistId", specialistId);
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/v1/specialists/upload-avatar`,
        formData,
        {
          headers: {
            ...getAuthHeader(),
            "Content-Type": "multipart/form-data"
          }
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
      const formData = new FormData();
      formData.append("file", file);
      formData.append("specialistId", specialistId);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/v1/specialists/upload-image`,
        formData,
        {
          headers: {
            ...getAuthHeader(),
            "Content-Type": "multipart/form-data"
          }
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
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/v1/specialists/images/${specialistId}`,
        {
          headers: getAuthHeader(),
          params: { imageUrl }
        }
      );

      return response.data;
    } catch (error) {
      console.error("Lỗi khi xóa ảnh:", error);
      throw error;
    }
  }
};

export default SpecialistService; 