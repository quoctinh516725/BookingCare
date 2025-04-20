// Dữ liệu mẫu cho danh mục chuyên viên
let mockCategories = [
  {
    id: "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
    name: "Chuyên khoa Tim mạch",
    code: "CARDIOLOGY",
    description: "Chuyên gia về các bệnh tim mạch và điều trị các vấn đề tim",
    specialistCount: 12,
    isActive: true,
    createdAt: "2023-07-15T08:30:00Z",
    updatedAt: "2023-09-20T14:15:00Z"
  },
  {
    id: "2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e",
    name: "Chuyên khoa Thần kinh",
    code: "NEUROLOGY",
    description: "Chẩn đoán và điều trị các bệnh liên quan đến hệ thần kinh",
    specialistCount: 8,
    isActive: true,
    createdAt: "2023-06-10T09:45:00Z",
    updatedAt: "2023-10-05T11:20:00Z"
  },
  {
    id: "3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f",
    name: "Chuyên khoa Da liễu",
    code: "DERMATOLOGY",
    description: "Điều trị các vấn đề về da, tóc và móng",
    specialistCount: 10,
    isActive: true,
    createdAt: "2023-05-22T10:15:00Z",
    updatedAt: "2023-08-18T13:40:00Z"
  },
  {
    id: "4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9a",
    name: "Chuyên khoa Tiêu hóa",
    code: "GASTROENTEROLOGY",
    description: "Chuyên gia trong chẩn đoán và điều trị các bệnh về đường tiêu hóa",
    specialistCount: 6,
    isActive: true,
    createdAt: "2023-08-05T11:30:00Z",
    updatedAt: "2023-11-10T09:55:00Z"
  },
  {
    id: "5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b",
    name: "Chuyên khoa Nhi",
    code: "PEDIATRICS",
    description: "Chăm sóc sức khỏe toàn diện cho trẻ em từ sơ sinh đến tuổi vị thành niên",
    specialistCount: 15,
    isActive: true,
    createdAt: "2023-04-18T14:20:00Z",
    updatedAt: "2023-09-30T10:10:00Z"
  }
];

// Cache cho dữ liệu
const cache = {
  categories: {
    data: null,
    timestamp: null,
    expiry: 15 * 60 * 1000 // 15 phút
  },
  categoryDetails: {}
};

// Kiểm tra tính hợp lệ của cache
const isCacheValid = (cacheItem) => {
  if (!cacheItem || !cacheItem.data || !cacheItem.timestamp) {
    return false;
  }
  
  const now = Date.now();
  const expiry = cacheItem.expiry || 15 * 60 * 1000; // Mặc định 15 phút
  return (now - cacheItem.timestamp) < expiry;
};

/**
 * Service quản lý danh mục chuyên viên (specialist categories)
 */
const SpecialistCategoryService = {
  /**
   * Lấy danh sách tất cả các danh mục chuyên viên
   */
  getAllCategories: async () => {
    try {
      // Kiểm tra cache
      if (isCacheValid(cache.categories)) {
        console.log("Sử dụng dữ liệu danh mục đã lưu trong cache");
        return cache.categories.data;
      }

      // Trong môi trường thực tế, dưới đây sẽ là API call
      // Mock response
      const response = { data: mockCategories };

      // Lưu vào cache
      cache.categories.data = response.data || [];
      cache.categories.timestamp = Date.now();

      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách danh mục chuyên viên:", error);
      throw error;
    }
  },

  /**
   * Lấy thông tin một danh mục theo ID
   */
  getCategoryById: async (id) => {
    try {
      // Kiểm tra cache cho category cụ thể
      if (
        cache.categoryDetails[id] &&
        isCacheValid(cache.categoryDetails[id])
      ) {
        console.log(`Sử dụng dữ liệu của danh mục ${id} từ cache`);
        return cache.categoryDetails[id].data;
      }

      // Trong môi trường thực tế, đây sẽ là API call
      // Mock data
      const category = mockCategories.find(cat => cat.id === id);
      
      if (!category) {
        throw new Error(`Không tìm thấy danh mục với ID ${id}`);
      }

      // Lưu cache
      if (!cache.categoryDetails[id]) {
        cache.categoryDetails[id] = {
          data: null,
          timestamp: null,
          expiry: 15 * 60 * 1000 // 15 phút
        };
      }
      cache.categoryDetails[id].data = category;
      cache.categoryDetails[id].timestamp = Date.now();

      return category;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin danh mục ${id}:`, error);
      throw error;
    }
  },

  /**
   * Tạo mới một danh mục chuyên viên
   */
  createCategory: async (categoryData) => {
    try {
      // Trong môi trường thực tế, đây sẽ là API call
      // Mock create action
      const newCategory = {
        id: Date.now().toString(),
        ...categoryData,
        specialistCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      mockCategories.push(newCategory);
      
      // Xóa cache
      cache.categories.data = null;
      cache.categories.timestamp = null;

      return newCategory;
    } catch (error) {
      console.error("Lỗi khi tạo danh mục chuyên viên mới:", error);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin danh mục chuyên viên
   */
  updateCategory: async (id, categoryData) => {
    try {
      // Trong môi trường thực tế, đây sẽ là API call
      // Mock update action
      const categoryIndex = mockCategories.findIndex(cat => cat.id === id);
      
      if (categoryIndex === -1) {
        throw new Error(`Không tìm thấy danh mục với ID ${id}`);
      }

      const updatedCategory = {
        ...mockCategories[categoryIndex],
        ...categoryData,
        updatedAt: new Date().toISOString()
      };

      mockCategories[categoryIndex] = updatedCategory;
      
      // Xóa cache
      cache.categories.data = null;
      cache.categories.timestamp = null;
      if (cache.categoryDetails[id]) {
        cache.categoryDetails[id].data = null;
        cache.categoryDetails[id].timestamp = null;
      }

      return updatedCategory;
    } catch (error) {
      console.error(`Lỗi khi cập nhật danh mục ${id}:`, error);
      throw error;
    }
  },

  /**
   * Xóa một danh mục chuyên viên
   */
  deleteCategory: async (id) => {
    try {
      // Trong môi trường thực tế, đây sẽ là API call
      // Mock delete action
      const categoryIndex = mockCategories.findIndex(cat => cat.id === id);
      
      if (categoryIndex === -1) {
        throw new Error(`Không tìm thấy danh mục với ID ${id}`);
      }

      mockCategories.splice(categoryIndex, 1);
      
      // Xóa cache
      cache.categories.data = null;
      cache.categories.timestamp = null;
      if (cache.categoryDetails[id]) {
        cache.categoryDetails[id].data = null;
        cache.categoryDetails[id].timestamp = null;
      }

      return { success: true, message: "Xóa danh mục thành công" };
    } catch (error) {
      console.error(`Lỗi khi xóa danh mục ${id}:`, error);
      throw error;
    }
  },

  /**
   * Xóa cache khi có thay đổi dữ liệu
   */
  clearCache: (cacheKey = null) => {
    if (cacheKey === "categories") {
      cache.categories.data = null;
      cache.categories.timestamp = null;
    } else if (cacheKey === "all") {
      cache.categories.data = null;
      cache.categories.timestamp = null;
      cache.categoryDetails = {};
    } else {
      // Xóa cache cho một category cụ thể
      if (cacheKey && cache.categoryDetails[cacheKey]) {
        cache.categoryDetails[cacheKey].data = null;
        cache.categoryDetails[cacheKey].timestamp = null;
      }
    }
  }
};

export default SpecialistCategoryService; 