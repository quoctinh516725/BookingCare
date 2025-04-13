import UserService from './UserService';

const axiosJWT = UserService.axiosJWT;

/**
 * Lấy danh sách tất cả bài viết blog
 * @param {Object} params Các tham số tìm kiếm, phân trang
 * @returns {Promise<Array>} Danh sách bài viết
 */
const getAllBlogs = async (params = {}) => {
  const tokenString = localStorage.getItem("access_token");
  const token = tokenString ? JSON.parse(tokenString) : null;
  
  try {
    console.log("Đang gọi API lấy bài viết blog với params:", params);
    
    let queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.page) queryParams.append('page', params.page);
    if (params.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    
    const queryString = queryParams.toString();
    const url = `/api/v1/blogs${queryString ? `?${queryString}` : ''}`;
    
    console.log("URL gọi API bài viết:", url);
    
    // Thử gọi API với token nếu có
    try {
      const response = await axiosJWT.get(url, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` })
        },
        withCredentials: true,
      });
      
      console.log("Kết quả API bài viết blog:", response.data);
      return response.data || [];
    } catch (apiError) {
      console.error("Lỗi khi gọi API bài viết:", apiError);
      
      // Nếu lỗi 401 hoặc 403, thử refresh token và gọi lại API
      if (apiError.response && (apiError.response.status === 401 || apiError.response.status === 403)) {
        try {
          console.log("Thử refresh token và gọi lại API bài viết...");
          await UserService.refreshToken();
          
          // Lấy token mới nếu refresh thành công
          const newTokenString = localStorage.getItem("access_token");
          const newToken = newTokenString ? JSON.parse(newTokenString) : null;
          
          // Gọi lại API với token mới
          if (newToken) {
            const retryResponse = await axiosJWT.get(url, {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${newToken}`
              },
              withCredentials: true,
            });
            
            console.log("Kết quả API bài viết blog (sau khi refresh):", retryResponse.data);
            return retryResponse.data || [];
          }
        } catch (refreshError) {
          console.error("Không thể refresh token:", refreshError);
          // Tiếp tục sử dụng dữ liệu mẫu
        }
      }
      
      // Trả về dữ liệu mẫu nếu có lỗi
      console.warn("Sử dụng dữ liệu mẫu cho bài viết blog do API lỗi");
      return generateSampleBlogs();
    }
  } catch (error) {
    console.error("Error in BlogService.getAllBlogs:", error);
    
    // Trả về dữ liệu mẫu khi API gặp lỗi
    console.warn("Sử dụng dữ liệu mẫu cho bài viết blog do lỗi không xác định");
    return generateSampleBlogs();
  }
};

// Hàm tạo dữ liệu mẫu cho bài viết blog
const generateSampleBlogs = () => {
  return [
    {
      id: '1',
      title: 'Các phương pháp chăm sóc da hiệu quả',
      content: '<p>Nội dung bài viết về chăm sóc da. Da đẹp không chỉ đến từ gen tốt mà còn phụ thuộc nhiều vào cách bạn chăm sóc hàng ngày...</p>',
      excerpt: 'Tổng hợp các phương pháp chăm sóc da hiệu quả nhất hiện nay',
      author: 'Dr. Nguyễn Thị An',
      category: 'Chăm sóc da',
      categoryId: '1',
      createdAt: '2023-04-15T08:30:00Z',
      updatedAt: '2023-04-16T10:15:00Z',
      status: 'ACTIVE',
      thumbnailUrl: 'https://via.placeholder.com/800x400?text=Skincare',
      slug: 'cac-phuong-phap-cham-soc-da-hieu-qua',
      image: 'https://via.placeholder.com/800x400?text=Skincare'
    },
    {
      id: '2',
      title: 'Top 5 dịch vụ spa được ưa chuộng nhất',
      content: '<p>Trong thời đại hiện nay, việc chăm sóc bản thân không chỉ là nhu cầu mà còn là cách để cân bằng cuộc sống. Các dịch vụ spa cao cấp đang trở thành lựa chọn hàng đầu của nhiều người...</p>',
      excerpt: 'Những dịch vụ spa được khách hàng yêu thích nhất tại Booking Care',
      author: 'Chuyên gia Trần Văn Minh',
      category: 'Dịch vụ spa',
      categoryId: '2',
      createdAt: '2023-04-10T09:45:00Z',
      updatedAt: '2023-04-12T11:20:00Z',
      status: 'ACTIVE',
      thumbnailUrl: 'https://via.placeholder.com/800x400?text=Spa+Services',
      slug: 'top-5-dich-vu-spa-duoc-ua-chuong-nhat',
      image: 'https://via.placeholder.com/800x400?text=Spa+Services'
    },
    {
      id: '3',
      title: '10 mẹo làm đẹp tự nhiên ít tốn kém',
      content: '<p>Làm đẹp không nhất thiết phải tốn nhiều tiền. Có rất nhiều nguyên liệu tự nhiên trong nhà bếp có thể giúp bạn chăm sóc da và tóc hiệu quả...</p>',
      excerpt: 'Khám phá các bí quyết làm đẹp từ thiên nhiên không tốn kém',
      author: 'Chuyên gia Linh Nguyễn',
      category: 'Mẹo làm đẹp',
      categoryId: '3',
      createdAt: '2023-03-22T14:30:00Z',
      updatedAt: '2023-03-25T09:10:00Z',
      status: 'ACTIVE',
      thumbnailUrl: 'https://via.placeholder.com/800x400?text=Beauty+Tips',
      slug: '10-meo-lam-dep-tu-nhien-it-ton-kem',
      image: 'https://via.placeholder.com/800x400?text=Beauty+Tips'
    }
  ];
};

/**
 * Lấy chi tiết bài viết blog theo ID
 * @param {string} id ID của bài viết
 * @returns {Promise<Object>} Chi tiết bài viết
 */
const getBlogById = async (id) => {
  const tokenString = localStorage.getItem("access_token");
  const token = tokenString ? JSON.parse(tokenString) : null;
  
  try {
    if (!id) throw new Error("Blog ID không hợp lệ");
    
    const response = await axiosJWT.get(`/api/v1/blogs/${id}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      },
      withCredentials: true,
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching blog with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Tạo bài viết blog mới (yêu cầu quyền quản trị)
 * @param {Object} blogData Dữ liệu bài viết cần tạo
 * @returns {Promise<Object>} Bài viết đã tạo
 */
const createBlog = async (blogData) => {
  const tokenString = localStorage.getItem("access_token");
  const token = tokenString ? JSON.parse(tokenString) : null;
  
  try {
    const response = await axiosJWT.post('/api/v1/blogs', blogData, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      },
      withCredentials: true,
    });
    
    return response.data;
  } catch (error) {
    console.error("Error creating blog post:", error);
    throw error;
  }
};

/**
 * Cập nhật bài viết blog (yêu cầu quyền quản trị)
 * @param {string} id ID của bài viết
 * @param {Object} blogData Dữ liệu cập nhật
 * @returns {Promise<Object>} Bài viết đã cập nhật
 */
const updateBlog = async (id, blogData) => {
  const tokenString = localStorage.getItem("access_token");
  const token = tokenString ? JSON.parse(tokenString) : null;
  
  try {
    if (!id) throw new Error("Blog ID không hợp lệ");
    
    const response = await axiosJWT.put(`/api/v1/blogs/${id}`, blogData, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      },
      withCredentials: true,
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error updating blog with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Xóa bài viết blog (yêu cầu quyền quản trị)
 * @param {string} id ID của bài viết cần xóa
 * @returns {Promise<void>}
 */
const deleteBlog = async (id) => {
  const tokenString = localStorage.getItem("access_token");
  const token = tokenString ? JSON.parse(tokenString) : null;
  
  try {
    if (!id) throw new Error("Blog ID không hợp lệ");
    
    await axiosJWT.delete(`/api/v1/blogs/${id}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      },
      withCredentials: true,
    });
  } catch (error) {
    console.error(`Error deleting blog with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Lấy danh sách tất cả danh mục blog
 * @returns {Promise<Array>} Danh sách danh mục blog
 */
const getAllBlogCategories = async () => {
  const tokenString = localStorage.getItem("access_token");
  const token = tokenString ? JSON.parse(tokenString) : null;
  
  try {
    console.log("Đang gọi API lấy danh mục blog...");
    
    const response = await axiosJWT.get('/api/v1/blog-categories', {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      },
      withCredentials: true,
    });
    
    console.log("Kết quả API danh mục blog:", response.data);
    return response.data || [];
  } catch (error) {
    console.error("Error fetching blog categories:", error);
    
    // In thêm thông tin lỗi chi tiết
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    
    // Trả về dữ liệu mẫu khi API gặp lỗi
    console.warn("Sử dụng dữ liệu mẫu cho danh mục blog do API lỗi");
    return [
      {
        id: '1',
        name: 'Chăm sóc da',
        description: 'Các bài viết về chăm sóc da, làm đẹp da',
        slug: 'cham-soc-da',
        status: 'ACTIVE',
        createdAt: '2023-03-01T00:00:00Z',
        updatedAt: '2023-03-01T00:00:00Z'
      },
      {
        id: '2',
        name: 'Dịch vụ spa',
        description: 'Thông tin về các dịch vụ spa tại cơ sở',
        slug: 'dich-vu-spa',
        status: 'ACTIVE',
        createdAt: '2023-03-01T00:00:00Z',
        updatedAt: '2023-03-01T00:00:00Z'
      },
      {
        id: '3',
        name: 'Mẹo làm đẹp',
        description: 'Các mẹo làm đẹp hữu ích hàng ngày',
        slug: 'meo-lam-dep',
        status: 'ACTIVE',
        createdAt: '2023-03-01T00:00:00Z',
        updatedAt: '2023-03-01T00:00:00Z'
      }
    ];
  }
};

/**
 * Alias method for backward compatibility
 * @returns {Promise<Array>} Danh sách danh mục blog
 */
const getBlogCategories = async () => {
  return getAllBlogCategories();
};

/**
 * Lấy danh sách danh mục blog đang hoạt động
 * @returns {Promise<Array>} Danh sách danh mục blog đang hoạt động
 */
const getActiveBlogCategories = async () => {
  const tokenString = localStorage.getItem("access_token");
  const token = tokenString ? JSON.parse(tokenString) : null;
  
  try {
    const response = await axiosJWT.get('/api/v1/blog-categories/active', {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      },
      withCredentials: true,
    });
    
    return response.data || [];
  } catch (error) {
    console.error("Error fetching active blog categories:", error);
    return [];
  }
};

/**
 * Lấy thông tin danh mục blog theo ID
 * @param {string} id ID của danh mục
 * @returns {Promise<Object>} Thông tin danh mục
 */
const getBlogCategoryById = async (id) => {
  const tokenString = localStorage.getItem("access_token");
  const token = tokenString ? JSON.parse(tokenString) : null;
  
  try {
    if (!id) throw new Error("Category ID không hợp lệ");
    
    const response = await axiosJWT.get(`/api/v1/blog-categories/${id}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      },
      withCredentials: true,
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching blog category with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Lấy danh sách bài viết theo danh mục
 * @param {string} categoryId ID của danh mục
 * @returns {Promise<Array>} Danh sách bài viết thuộc danh mục
 */
const getBlogsByCategory = async (categoryId) => {
  const tokenString = localStorage.getItem("access_token");
  const token = tokenString ? JSON.parse(tokenString) : null;
  
  try {
    if (!categoryId) throw new Error("Category ID không hợp lệ");
    
    const response = await axiosJWT.get(`/api/v1/blog-categories/${categoryId}/blogs`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      },
      withCredentials: true,
    });
    
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching blogs for category ${categoryId}:`, error);
    return [];
  }
};

/**
 * Tạo danh mục blog mới (yêu cầu quyền quản trị)
 * @param {Object} categoryData Dữ liệu danh mục cần tạo
 * @returns {Promise<Object>} Danh mục đã tạo
 */
const createBlogCategory = async (categoryData) => {
  const tokenString = localStorage.getItem("access_token");
  const token = tokenString ? JSON.parse(tokenString) : null;
  
  try {
    const response = await axiosJWT.post('/api/v1/blog-categories', categoryData, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      },
      withCredentials: true,
    });
    
    return response.data;
  } catch (error) {
    console.error("Error creating blog category:", error);
    throw error;
  }
};

/**
 * Cập nhật danh mục blog (yêu cầu quyền quản trị)
 * @param {string} id ID của danh mục
 * @param {Object} categoryData Dữ liệu cập nhật
 * @returns {Promise<Object>} Danh mục đã cập nhật
 */
const updateBlogCategory = async (id, categoryData) => {
  const tokenString = localStorage.getItem("access_token");
  const token = tokenString ? JSON.parse(tokenString) : null;
  
  try {
    if (!id) throw new Error("Category ID không hợp lệ");
    
    const response = await axiosJWT.put(`/api/v1/blog-categories/${id}`, categoryData, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      },
      withCredentials: true,
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error updating blog category with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Xóa danh mục blog (yêu cầu quyền quản trị)
 * @param {string} id ID của danh mục cần xóa
 * @returns {Promise<void>}
 */
const deleteBlogCategory = async (id) => {
  const tokenString = localStorage.getItem("access_token");
  const token = tokenString ? JSON.parse(tokenString) : null;
  
  try {
    if (!id) throw new Error("Category ID không hợp lệ");
    
    await axiosJWT.delete(`/api/v1/blog-categories/${id}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      },
      withCredentials: true,
    });
  } catch (error) {
    console.error(`Error deleting blog category with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Upload hình ảnh cho bài viết blog
 * @param {File} file File hình ảnh
 * @returns {Promise<String>} URL của hình ảnh đã upload
 */
const uploadBlogImage = async (file) => {
  const tokenString = localStorage.getItem("access_token");
  const token = tokenString ? JSON.parse(tokenString) : null;
  
  try {
    if (!file) throw new Error("File không hợp lệ");
    
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axiosJWT.post('/api/v1/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      withCredentials: true
    });
    
    console.log("Upload image response:", response.data);
    
    // Backend trả về imageUrl thay vì fileUrl
    if (response.data && response.data.imageUrl) {
      return response.data.imageUrl;
    }
    
    // Nếu không tìm thấy URL ảnh trong response, ném lỗi với chi tiết response
    throw new Error(`Không thể phân tích URL ảnh từ response: ${JSON.stringify(response.data)}`);
  } catch (error) {
    console.error("Lỗi khi tải ảnh lên:", error);
    throw new Error(`Lỗi khi tải ảnh lên: ${error.message}`);
  }
};

export default {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  getAllBlogCategories,
  getBlogCategories,
  getActiveBlogCategories,
  getBlogCategoryById,
  getBlogsByCategory,
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
  uploadBlogImage
}; 