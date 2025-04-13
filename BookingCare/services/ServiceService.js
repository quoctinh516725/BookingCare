import UserService from './UserService';
import axios from 'axios';

// Use axiosJWT from UserService for requests that need automatic token refreshing
const axiosJWT = UserService.axiosJWT;

/**
 * Lấy danh sách tất cả dịch vụ
 * @param {Object} params - Các tham số tìm kiếm, lọc (category, search, limit, page)
 * @returns {Promise<Array>} Danh sách dịch vụ
 */
const getAllServices = async (params = {}) => {
  try {
    // Xây dựng query string từ params
    const queryParams = new URLSearchParams();
    
    if (params.category && params.category !== 'all') {
      queryParams.append('categoryId', params.category);
    }
    
    if (params.search) {
      queryParams.append('search', params.search);
    }
    
    if (params.limit) {
      queryParams.append('limit', params.limit);
    }
    
    if (params.page) {
      queryParams.append('page', params.page);
    }
    
    if (params.status) {
      queryParams.append('status', params.status);
    }
    
    const queryString = queryParams.toString();
    const url = `/api/v1/services${queryString ? `?${queryString}` : ''}`;

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
      ? response.data.map((service) => ({
          ...service,
          id: service.id || null,
          name: service.name || "Dịch vụ chưa đặt tên",
          price: service.price || 0,
          duration: service.duration || 0,
        }))
      : [];

    return validatedServices;
  } catch (error) {
    console.error("Error in getAllServices:", error);
    
    // Trả về mảng rỗng nếu có lỗi xảy ra
    return [];
  }
};

/**
 * Lấy thông tin chi tiết của một dịch vụ
 * @param {string} id - ID của dịch vụ
 * @returns {Promise<Object>} Thông tin chi tiết dịch vụ
 */
const getServiceById = async (id) => {
  // Validate ID
  if (id === undefined || id === null || id === "" || id === "undefined") {
    console.error("Invalid service ID:", id);
    throw new Error("ID dịch vụ không hợp lệ");
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
      throw new Error("Không tìm thấy dữ liệu dịch vụ");
    }

    // Ensure all necessary fields are present
    const serviceData = {
      ...response.data,
      id: response.data.id || id,
      name: response.data.name || "Dịch vụ chưa có tên",
      description: response.data.description || "Chưa có mô tả",
      price: response.data.price || 0,
      duration: response.data.duration || 0,
    };

    return serviceData;
  } catch (error) {
    console.error(`Error fetching service with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Lấy danh sách dịch vụ phổ biến
 * @returns {Promise<Array>} Danh sách dịch vụ phổ biến
 */
const getPopularServices = async () => {
  const tokenString = localStorage.getItem("access_token");
  const token = tokenString ? JSON.parse(tokenString) : null;

  try {
    const response = await axiosJWT.get(`/api/v1/services/popular`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      withCredentials: true,
    });
    
    return response.data || [];
  } catch (error) {
    console.error("Error fetching popular services:", error);
    return [];
  }
};

/**
 * Tạo dịch vụ mới (yêu cầu quyền quản trị)
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
        ...(token && { Authorization: `Bearer ${token}` }),
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
 * Cập nhật thông tin dịch vụ (yêu cầu quyền quản trị)
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
        ...(token && { Authorization: `Bearer ${token}` }),
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
 * Xóa dịch vụ (yêu cầu quyền quản trị)
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
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      withCredentials: true,
    });
  } catch (error) {
    console.error(`Error deleting service with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Upload ảnh dịch vụ
 * @param {File} file File ảnh cần upload
 * @returns {Promise<string>} URL của ảnh đã upload
 */
const uploadServiceImage = async (file) => {
  const tokenString = localStorage.getItem("access_token");
  const token = tokenString ? JSON.parse(tokenString) : null;

  // Tạo FormData để gửi file
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axiosJWT.post("/api/v1/services/upload-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      withCredentials: true,
    });

    return response.data.imageUrl || response.data.fileUrl;
  } catch (error) {
    console.error("Error uploading service image:", error);
    throw error;
  }
};

/**
 * Lấy dịch vụ theo danh mục
 * @param {string} categoryId ID của danh mục
 * @returns {Promise<Array>} Danh sách dịch vụ thuộc danh mục
 */
const getServicesByCategory = async (categoryId) => {
  try {
    if (!categoryId) {
      return await getAllServices();
    }
    
    const response = await axios.get(`/api/v1/services/category/${categoryId}`, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching services for category ${categoryId}:`, error);
    return [];
  }
};

export default {
  getAllServices,
  getServiceById,
  getPopularServices,
  createService,
  updateService,
  deleteService,
  uploadServiceImage,
  getServicesByCategory
}; 