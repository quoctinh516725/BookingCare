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
    // Thử gọi API với token nếu có
    try {
      const response = await axiosJWT.get(`/api/v1/service-categories`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        withCredentials: true,
      });
      
      return response.data || [];
    } catch (apiError) {
      console.error("Lỗi khi gọi API danh mục dịch vụ:", apiError);
      
      // Nếu lỗi 401 hoặc 403, thử refresh token và gọi lại API
      if (apiError.response && (apiError.response.status === 401 || apiError.response.status === 403)) {
        try {
          console.log("Thử refresh token và gọi lại API danh mục...");
          await UserService.refreshToken();
          
          // Lấy token mới nếu refresh thành công
          const newTokenString = localStorage.getItem("access_token");
          const newToken = newTokenString ? JSON.parse(newTokenString) : null;
          
          // Gọi lại API với token mới
          if (newToken) {
            const retryResponse = await axiosJWT.get(`/api/v1/service-categories`, {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${newToken}`
              },
              withCredentials: true,
            });
            
            return retryResponse.data || [];
          }
        } catch (refreshError) {
          console.error("Không thể refresh token:", refreshError);
          // Tiếp tục sử dụng dữ liệu mẫu
        }
      }
      
      // Trả về dữ liệu mẫu khi API gặp lỗi
      console.warn("Sử dụng dữ liệu mẫu cho danh mục dịch vụ do API lỗi");
      return generateSampleCategories();
    }
  } catch (error) {
    console.error("Error in ServiceCategoryService.getAllCategories:", error);
    
    // Trả về dữ liệu mẫu khi API gặp lỗi
    return generateSampleCategories();
  }
};

// Hàm tạo dữ liệu mẫu cho danh mục dịch vụ
const generateSampleCategories = () => {
  return [
    {
      id: '1',
      name: 'Chăm sóc da',
      description: 'Các dịch vụ chăm sóc và làm đẹp da',
      image: 'https://via.placeholder.com/300x200?text=Skin+Care',
      status: 'ACTIVE'
    },
    {
      id: '2',
      name: 'Massage',
      description: 'Các loại massage thư giãn và trị liệu',
      image: 'https://via.placeholder.com/300x200?text=Massage',
      status: 'ACTIVE'
    },
    {
      id: '3',
      name: 'Trang điểm',
      description: 'Dịch vụ trang điểm chuyên nghiệp',
      image: 'https://via.placeholder.com/300x200?text=Makeup',
      status: 'ACTIVE'
    }
  ];
};

/**
 * Lấy danh sách danh mục đang hoạt động
 * @returns {Promise<Array>} Danh sách danh mục dịch vụ đang hoạt động
 */
const getActiveCategories = async () => {
  const tokenString = localStorage.getItem("access_token");
  const token = tokenString ? JSON.parse(tokenString) : null;
  
  try {
    try {
      const response = await axiosJWT.get(`/api/v1/service-categories/active`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        withCredentials: true,
      });
      
      return response.data || [];
    } catch (apiError) {
      console.error("Lỗi khi gọi API danh mục dịch vụ đang hoạt động:", apiError);
      
      // Trả về danh mục mẫu với trạng thái active
      return generateSampleCategories();
    }
  } catch (error) {
    console.error("Error in ServiceCategoryService.getActiveCategories:", error);
    return generateSampleCategories();
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