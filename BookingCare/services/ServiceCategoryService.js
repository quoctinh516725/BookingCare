import UserService from './UserService';

const axiosJWT = UserService.axiosJWT;

/**
 * Lấy danh sách tất cả danh mục
 * @returns {Promise<Array>} Danh sách danh mục dịch vụ
 */
const getAllCategories = async () => {
  const tokenString = localStorage.getItem("access_token");
  const token = tokenString ? JSON.parse(tokenString) : null;
  
  try {
    const response = await axiosJWT.get(`/api/v1/service-categories`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      },
      withCredentials: true,
    });
    
    return response.data || [];
  } catch (error) {
    console.error("Error fetching service categories:", error);
    return [];
  }
};

/**
 * Lấy danh sách danh mục đang hoạt động
 * @returns {Promise<Array>} Danh sách danh mục dịch vụ đang hoạt động
 */
const getActiveCategories = async () => {
  const tokenString = localStorage.getItem("access_token");
  const token = tokenString ? JSON.parse(tokenString) : null;
  
  try {
    const response = await axiosJWT.get(`/api/v1/service-categories/active`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      },
      withCredentials: true,
    });
    
    return response.data || [];
  } catch (error) {
    console.error("Error fetching active service categories:", error);
    return [];
  }
};

/**
 * Lấy thông tin danh mục theo ID
 * @param {string} id ID của danh mục
 * @returns {Promise<Object>} Thông tin danh mục
 */
const getCategoryById = async (id) => {
  const tokenString = localStorage.getItem("access_token");
  const token = tokenString ? JSON.parse(tokenString) : null;
  
  try {
    const response = await axiosJWT.get(`/api/v1/service-categories/${id}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      },
      withCredentials: true,
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching category with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Lấy danh sách dịch vụ theo danh mục
 * @param {string} categoryId ID của danh mục
 * @returns {Promise<Array>} Danh sách dịch vụ thuộc danh mục
 */
const getServicesByCategory = async (categoryId) => {
  const tokenString = localStorage.getItem("access_token");
  const token = tokenString ? JSON.parse(tokenString) : null;
  
  try {
    const response = await axiosJWT.get(`/api/v1/service-categories/${categoryId}/services`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      },
      withCredentials: true,
    });
    
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching services for category ${categoryId}:`, error);
    return [];
  }
};

/**
 * Tạo danh mục mới (yêu cầu quyền quản trị)
 * @param {Object} categoryData Dữ liệu danh mục cần tạo
 * @returns {Promise<Object>} Thông tin danh mục đã tạo
 */
const createCategory = async (categoryData) => {
  const tokenString = localStorage.getItem("access_token");
  const token = tokenString ? JSON.parse(tokenString) : null;
  
  try {
    const response = await axiosJWT.post(`/api/v1/service-categories`, categoryData, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      },
      withCredentials: true,
    });
    
    return response.data;
  } catch (error) {
    console.error("Error creating service category:", error);
    throw error;
  }
};

/**
 * Cập nhật danh mục (yêu cầu quyền quản trị)
 * @param {string} id ID của danh mục
 * @param {Object} categoryData Dữ liệu cập nhật
 * @returns {Promise<Object>} Thông tin danh mục đã cập nhật
 */
const updateCategory = async (id, categoryData) => {
  const tokenString = localStorage.getItem("access_token");
  const token = tokenString ? JSON.parse(tokenString) : null;
  
  try {
    const response = await axiosJWT.put(`/api/v1/service-categories/${id}`, categoryData, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      },
      withCredentials: true,
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error updating category with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Xóa danh mục (yêu cầu quyền quản trị)
 * @param {string} id ID của danh mục cần xóa
 * @returns {Promise<void>}
 */
const deleteCategory = async (id) => {
  const tokenString = localStorage.getItem("access_token");
  const token = tokenString ? JSON.parse(tokenString) : null;
  
  try {
    await axiosJWT.delete(`/api/v1/service-categories/${id}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      },
      withCredentials: true,
    });
  } catch (error) {
    console.error(`Error deleting category with ID ${id}:`, error);
    throw error;
  }
};

export default {
  getAllCategories,
  getActiveCategories,
  getCategoryById,
  getServicesByCategory,
  createCategory,
  updateCategory,
  deleteCategory
}; 