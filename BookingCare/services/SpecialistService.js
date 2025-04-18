import UserService from "./UserService";

// Sử dụng axiosJWT để có khả năng tự động refresh token
const axiosJWT = UserService.axiosJWT;

// Cache để lưu trữ dữ liệu
const cache = {
  specialists: {
    data: null,
    timestamp: null,
    expiry: 5 * 60 * 1000, // Cache hết hạn sau 5 phút
  },
  specialties: {
    data: null,
    timestamp: null,
    expiry: 15 * 60 * 1000, // Cache hết hạn sau 15 phút
  },
  specialistsBySpecialty: {},
  specialistDetails: {},
};

// Helper function kiểm tra cache có còn hạn không
const isCacheValid = (cacheItem) => {
  if (!cacheItem.data || !cacheItem.timestamp) return false;
  return Date.now() - cacheItem.timestamp < cacheItem.expiry;
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
      // Kiểm tra cache
      if (isCacheValid(cache.specialists)) {
        console.log("Using cached specialists data");
        return cache.specialists.data;
      }

      const tokenString = localStorage.getItem("access_token");
      const token = tokenString ? JSON.parse(tokenString) : null;

      const response = await axiosJWT.get(`/api/v1/specialists`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        withCredentials: true,
      });

      // Lưu vào cache
      cache.specialists.data = response.data || [];
      cache.specialists.timestamp = Date.now();

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
      // Kiểm tra cache cho specialist cụ thể
      if (
        cache.specialistDetails[id] &&
        isCacheValid(cache.specialistDetails[id])
      ) {
        console.log(`Using cached data for specialist ${id}`);
        return cache.specialistDetails[id].data;
      }

      const tokenString = localStorage.getItem("access_token");
      const token = tokenString ? JSON.parse(tokenString) : null;

      const response = await axiosJWT.get(`/api/v1/specialists/${id}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        withCredentials: true,
      });

      // Lưu cache
      if (!cache.specialistDetails[id]) {
        cache.specialistDetails[id] = {
          data: null,
          timestamp: null,
          expiry: 10 * 60 * 1000, // 10 phút
        };
      }
      cache.specialistDetails[id].data = response.data;
      cache.specialistDetails[id].timestamp = Date.now();

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

      const response = await axiosJWT.get(
        `/api/v1/specialists/user/${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        `Lỗi khi lấy thông tin chuyên gia theo userId ${userId}:`,
        error
      );
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

      const response = await axiosJWT.post(
        `/api/v1/specialists`,
        specialistData,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          withCredentials: true,
        }
      );
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
    console.log("specialistData", specialistData);
    try {
      const tokenString = localStorage.getItem("access_token");
      const token = tokenString ? JSON.parse(tokenString) : null;

      const response = await axiosJWT.put(
        `/api/v1/specialists/${id}`,
        specialistData,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          withCredentials: true,
        }
      );
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
          ...(token && { Authorization: `Bearer ${token}` }),
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
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        withCredentials: true,
        params: { query },
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
      // Kiểm tra cache cho specialty cụ thể
      const cacheKey = typeof specialty === "object" ? specialty.id : specialty;
      if (
        cache.specialistsBySpecialty[cacheKey] &&
        isCacheValid(cache.specialistsBySpecialty[cacheKey])
      ) {
        console.log(`Using cached data for specialty ${cacheKey}`);
        return cache.specialistsBySpecialty[cacheKey].data;
      }

      const tokenString = localStorage.getItem("access_token");
      const token = tokenString ? JSON.parse(tokenString) : null;

      const response = await axiosJWT.get(
        `/api/v1/specialists/specialty/${specialty}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          withCredentials: true,
        }
      );

      // Lưu cache
      if (!cache.specialistsBySpecialty[cacheKey]) {
        cache.specialistsBySpecialty[cacheKey] = {
          data: null,
          timestamp: null,
          expiry: 5 * 60 * 1000, // 5 phút
        };
      }
      cache.specialistsBySpecialty[cacheKey].data = response.data || [];
      cache.specialistsBySpecialty[cacheKey].timestamp = Date.now();

      return response.data;
    } catch (error) {
      console.error(
        `Lỗi khi lấy chuyên gia theo chuyên môn ${specialty}:`,
        error
      );
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

      const response = await axiosJWT.get(
        `/api/v1/specialists/status/${status}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          withCredentials: true,
        }
      );
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
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        withCredentials: true,
        params: { limit },
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

      const response = await axiosJWT.get(
        `/api/v1/specialists/check/${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        `Lỗi khi kiểm tra user ${userId} có phải là chuyên gia không:`,
        error
      );
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
            "Content-Type": "multipart/form-data",
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
            "Content-Type": "multipart/form-data",
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
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          withCredentials: true,
          params: { imageUrl },
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
      // Kiểm tra cache cho specialties
      if (isCacheValid(cache.specialties)) {
        console.log("Using cached specialties data");
        return cache.specialties.data;
      }

      // Sử dụng danh sách mẫu thay vì gọi API vì API đang lỗi
      console.log("Sử dụng danh sách chuyên môn mẫu");
      const fallbackData = [
        { id: 1, name: "Bác sĩ da liễu" },
        { id: 2, name: "Chuyên gia điều trị mụn" },
        { id: 3, name: "Chuyên gia trị liệu" },
        { id: 4, name: "Chuyên gia chăm sóc da" },
        { id: 5, name: "Chuyên gia trẻ hóa da" },
      ];

      // Lưu cache cho dữ liệu fallback
      cache.specialties.data = fallbackData;
      cache.specialties.timestamp = Date.now();

      return fallbackData;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách chuyên môn:", error);
      return [];
    }
  },

  /**
   * Xóa cache khi có thay đổi dữ liệu
   */
  clearCache: (cacheKey = null) => {
    if (cacheKey === "specialists") {
      cache.specialists.data = null;
      cache.specialists.timestamp = null;
    } else if (cacheKey === "specialties") {
      cache.specialties.data = null;
      cache.specialties.timestamp = null;
    } else if (cacheKey === "all") {
      cache.specialists.data = null;
      cache.specialists.timestamp = null;
      cache.specialties.data = null;
      cache.specialties.timestamp = null;
      cache.specialistsBySpecialty = {};
      cache.specialistDetails = {};
    } else {
      // Xóa cache cho một specialty cụ thể
      if (cacheKey && cache.specialistsBySpecialty[cacheKey]) {
        cache.specialistsBySpecialty[cacheKey].data = null;
        cache.specialistsBySpecialty[cacheKey].timestamp = null;
      }
      // Xóa cache cho một specialist cụ thể
      if (cacheKey && cache.specialistDetails[cacheKey]) {
        cache.specialistDetails[cacheKey].data = null;
        cache.specialistDetails[cacheKey].timestamp = null;
      }
    }
  },
};

// Thêm clearCache vào các hàm thay đổi dữ liệu
const originalCreateSpecialist = SpecialistService.createSpecialist;
SpecialistService.createSpecialist = async (specialistData) => {
  const result = await originalCreateSpecialist(specialistData);
  SpecialistService.clearCache("all");
  return result;
};

const originalUpdateSpecialist = SpecialistService.updateSpecialist;
SpecialistService.updateSpecialist = async (id, specialistData) => {
  const result = await originalUpdateSpecialist(id, specialistData);
  SpecialistService.clearCache("all");
  SpecialistService.clearCache(id);
  return result;
};

const originalDeleteSpecialist = SpecialistService.deleteSpecialist;
SpecialistService.deleteSpecialist = async (id) => {
  const result = await originalDeleteSpecialist(id);
  SpecialistService.clearCache("all");
  SpecialistService.clearCache(id);
  return result;
};

export default SpecialistService;
