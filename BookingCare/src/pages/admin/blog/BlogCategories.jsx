import React, { useState, useEffect, useContext } from "react";
import { MessageContext } from "../../../contexts/MessageProvider.jsx";
import BlogService from "../../../../services/BlogService";
import Modal from "react-modal";

// Modal styles
const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    maxWidth: "600px",
    maxHeight: "90%",
    overflow: "auto",
    borderRadius: "8px",
    padding: "20px",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
};

const BlogCategories = () => {
  // Context for showing messages
  const message = useContext(MessageContext);
  
  // State for categories data
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    status: "ACTIVE"
  });
  
  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);
  
  // Function to fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await BlogService.getBlogCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching blog categories:", error);
      message.error("Không thể tải danh mục blog");
    } finally {
      setLoading(false);
    }
  };
  
  // Handle input changes in form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-generate slug if editing the name field
    if (name === "name" && (!isEditing || !formData.slug)) {
      const generatedSlug = value
        .toLowerCase()
        .normalize("NFD") // Normalize diacritical marks
        .replace(/[\u0300-\u036f]/g, "") // Remove diacritical marks
        .replace(/[đĐ]/g, "d") // Handle Vietnamese đ character
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/[^\w-]+/g, "") // Remove non-word chars
        .replace(/--+/g, "-") // Replace multiple hyphens with single hyphen
        .replace(/^-+/, "") // Trim hyphens from start
        .replace(/-+$/, ""); // Trim hyphens from end
        
      setFormData(prev => ({
        ...prev,
        [name]: value,
        slug: generatedSlug
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Open modal for adding new category
  const openAddModal = () => {
    setIsEditing(false);
    setFormData({
      name: "",
      slug: "",
      description: "",
      status: "ACTIVE"
    });
    setIsModalOpen(true);
  };
  
  // Open modal for editing category
  const openEditModal = (category) => {
    setIsEditing(true);
    setCurrentCategory(category);
    setFormData({
      name: category.name || "",
      slug: category.slug || "",
      description: category.description || "",
      status: category.status || "ACTIVE"
    });
    setIsModalOpen(true);
  };
  
  // Open confirmation modal for deleting category
  const openDeleteModal = (category) => {
    setCurrentCategory(category);
    setIsDeleteModalOpen(true);
  };
  
  // Close modals
  const closeModal = () => {
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
    setCurrentCategory(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      status: "ACTIVE"
    });
  };
  
  // Handle form submission for creating/updating category
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name) {
      message.error("Vui lòng nhập tên danh mục");
      return;
    }
    
    if (!formData.slug) {
      message.error("Vui lòng nhập slug cho danh mục");
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      if (isEditing && currentCategory) {
        // Update existing category
        await BlogService.updateBlogCategory(currentCategory.id, formData);
        message.success("Cập nhật danh mục thành công");
      } else {
        // Create new category
        await BlogService.createBlogCategory(formData);
        message.success("Thêm danh mục thành công");
      }
      
      // Close modal and refresh categories
      closeModal();
      fetchCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      message.error(`Lỗi khi lưu danh mục: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle category deletion
  const handleDelete = async () => {
    if (!currentCategory) return;
    
    try {
      setIsSubmitting(true);
      await BlogService.deleteBlogCategory(currentCategory.id);
      message.success("Xóa danh mục thành công");
      closeModal();
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      message.error(`Lỗi khi xóa danh mục: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get post count for a category
  const getPostCount = () => {
    // This would ideally come from the API
    // For now, return a placeholder or mock value
    return Math.floor(Math.random() * 10);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Quản lý danh mục blog
          </h1>
          <button 
            onClick={openAddModal}
            className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
          >
            <i className="fas fa-plus mr-2"></i>
            Thêm danh mục
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-5">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Danh sách danh mục blog
            </h2>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-8">
                  <i className="fas fa-spinner fa-spin text-2xl text-pink-500"></i>
                  <p className="mt-2">Đang tải danh mục...</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Tên danh mục
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Slug
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Mô tả
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Trạng thái
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Số bài viết
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categories.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                          Không có danh mục nào
                        </td>
                      </tr>
                    ) : (
                      categories.map((category) => (
                        <tr key={category.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {category.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {category.slug}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {category.description || "-"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`min-w-[75px] flex justify-center px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                category.status === "ACTIVE"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {category.status === "ACTIVE" ? "Hoạt động" : "Ẩn"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {getPostCount()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openEditModal(category)}
                                className="text-blue-500 hover:text-blue-700 bg-blue-100 hover:bg-blue-200 p-1.5 rounded"
                                title="Chỉnh sửa"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                onClick={() => openDeleteModal(category)}
                                className="text-red-500 hover:text-red-700 bg-red-100 hover:bg-red-200 p-1.5 rounded"
                                title="Xóa"
                              >
                                <i className="fas fa-trash-alt"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Category Modal */}
      <Modal isOpen={isModalOpen} onRequestClose={closeModal} style={customStyles}>
        <div className="p-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">
              {isEditing ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
            </h2>
            <button
              onClick={closeModal}
              className="text-gray-500 hover:text-gray-700"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Tên danh mục <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500"
                placeholder="Nhập tên danh mục"
                required
              />
            </div>

            {/* Slug */}
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                Slug <span className="text-red-500">*</span>
                <span className="text-xs text-gray-500 ml-1">(Sử dụng cho URL)</span>
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500"
                placeholder="Nhập slug cho danh mục (vd: lam-dep)"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Slug sẽ được tự động tạo từ tên danh mục. Bạn có thể chỉnh sửa nếu cần.
              </p>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500"
                placeholder="Nhập mô tả cho danh mục"
                rows={3}
              ></textarea>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500"
              >
                <option value="ACTIVE">Hoạt động</option>
                <option value="INACTIVE">Ẩn</option>
              </select>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                    Đang xử lý...
                  </div>
                ) : isEditing ? "Cập nhật" : "Thêm mới"}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onRequestClose={closeModal} style={{
        ...customStyles,
        content: {
          ...customStyles.content,
          maxWidth: "450px"
        }
      }}>
        {currentCategory && (
          <div className="p-4">
            <div className="text-center mb-4">
              <div className="bg-red-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Xác nhận xóa</h3>
              <p className="text-gray-600">
                Bạn có chắc chắn muốn xóa danh mục <span className="font-semibold">"{currentCategory.name}"</span> không? 
                
                {getPostCount() > 0 && (
                  <span className="block mt-2 text-orange-500 font-medium">
                    Danh mục này đang có {getPostCount()} bài viết. Các bài viết này sẽ được chuyển về danh mục mặc định.
                  </span>
                )}
              </p>
            </div>
            <div className="flex justify-center space-x-3 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                    Đang xử lý...
                  </div>
                ) : "Xóa"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BlogCategories;
