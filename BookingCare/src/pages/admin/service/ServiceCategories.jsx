import React, { useState } from "react";
import { Link } from "react-router-dom";
import Modal from "react-modal";
import ServiceCategoryService from "../../../../services/ServiceCategoryService";
import { useContext } from "react";
import { MessageContext } from "../../../contexts/MessageProvider.jsx";
import { useAdminServiceCache } from "../contexts/AdminServiceCacheContext";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    maxWidth: "90%",
    borderRadius: "8px",
    padding: "20px",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
};

const ServiceCategories = () => {
  const message = useContext(MessageContext);
  const { 
    categories, 
    categoriesLoading, 
    invalidateCategoriesCache 
  } = useAdminServiceCache();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryCode, setCategoryCode] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});
  const [currentCategoryId, setCurrentCategoryId] = useState(null);

  const validateForm = () => {
    const newErrors = {};
    if (!categoryName.trim()) {
      newErrors.categoryName = "Tên danh mục không được để trống";
    }
    
    if (!categoryCode.trim()) {
      newErrors.categoryCode = "Mã danh mục không được để trống";
    } else if (!/^[A-Za-z0-9_-]+$/.test(categoryCode)) {
      newErrors.categoryCode = "Mã danh mục chỉ chứa chữ cái, số, gạch ngang và gạch dưới";
    }
    
    if (!description.trim()) {
      newErrors.description = "Mô tả không được để trống";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        const categoryData = {
          name: categoryName,
          code: categoryCode,
          description,
          isActive: true
        };
        
        if (isEditMode) {
          await ServiceCategoryService.updateCategory(currentCategoryId, categoryData);
          message.success("Cập nhật danh mục thành công");
        } else {
          await ServiceCategoryService.createCategory(categoryData);
          message.success("Thêm danh mục thành công");
        }
        
        // Invalidate and refresh the categories cache
        invalidateCategoriesCache();
        handleClose();
      } catch (error) {
        console.error("Error saving category:", error);
        const errorMessage = error.response?.data?.message || "Có lỗi xảy ra khi lưu danh mục";
        message.error(errorMessage);
      }
    }
  };

  const handleEdit = (category) => {
    setCurrentCategoryId(category.id);
    setCategoryName(category.name);
    setCategoryCode(category.code);
    setDescription(category.description);
    setIsEditMode(true);
    setIsOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này không?")) {
      try {
        await ServiceCategoryService.deleteCategory(id);
        message.success("Xóa danh mục thành công");
        
        // Invalidate and refresh the categories cache
        invalidateCategoriesCache();
      } catch (error) {
        console.error("Error deleting category:", error);
        const errorMessage = error.response?.data?.message || "Có lỗi xảy ra khi xóa danh mục";
        message.error(errorMessage);
      }
    }
  };

  const handleOpenModal = () => {
    setIsEditMode(false);
    setCategoryName("");
    setCategoryCode("");
    setDescription("");
    setCurrentCategoryId(null);
    setErrors({});
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setCategoryName("");
    setCategoryCode("");
    setDescription("");
    setErrors({});
    setIsEditMode(false);
    setCurrentCategoryId(null);
  };

  // Function to manually refresh category data
  const handleRefreshData = () => {
    invalidateCategoriesCache();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Quản lý danh mục dịch vụ</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleRefreshData}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer"
          >
            <i className="fas fa-sync-alt"></i>
            <span>Làm mới</span>
          </button>
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md cursor-pointer"
          >
            <i className="fas fa-plus-circle"></i>
            <span>Thêm danh mục</span>
          </button>
        </div>
      </div>

      {/* Categories content */}
      <div className="bg-white rounded-md shadow-sm p-6">
        <h2 className="text-lg font-medium mb-4">Danh sách danh mục dịch vụ</h2>

        {categoriesLoading ? (
          <div className="text-center py-4">
            <i className="fas fa-spinner fa-spin text-2xl text-pink-500"></i>
            <p className="mt-2">Đang tải danh mục...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên danh mục
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã danh mục
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mô tả
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số dịch vụ
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      Không có danh mục nào
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">{category.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{category.code}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{category.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {category.serviceCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <span 
                          className="text-blue-500 hover:text-blue-700 bg-blue-100 hover:bg-blue-200 p-1 rounded mr-2 cursor-pointer"
                          onClick={() => handleEdit(category)}
                        >
                          <i className="fas fa-edit"></i>
                        </span>
                        <span 
                          className="text-red-500 hover:text-red-700 bg-red-100 hover:bg-red-200 p-1 rounded cursor-pointer"
                          onClick={() => handleDelete(category.id)}
                        >
                          <i className="fas fa-trash-alt"></i>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isOpen} onRequestClose={handleClose} style={customStyles}>
        <div className="bg-white rounded-lg p-6 w-[500px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              {isEditMode ? "Cập nhật danh mục dịch vụ" : "Thêm danh mục dịch vụ mới"}
            </h2>
            <span
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              <i className="fas fa-times"></i>
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            {isEditMode 
              ? "Cập nhật thông tin danh mục dịch vụ" 
              : "Tạo danh mục dịch vụ mới để phân loại các dịch vụ."}
          </p>
          <div className="space-y-4">
            <div>
              <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-1">
                Tên danh mục <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="categoryName"
                className={`w-full p-2 border ${errors.categoryName ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500`}
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Nhập tên danh mục"
              />
              {errors.categoryName && (
                <p className="mt-1 text-sm text-red-500">{errors.categoryName}</p>
              )}
            </div>

            <div>
              <label htmlFor="categoryCode" className="block text-sm font-medium text-gray-700 mb-1">
                Mã danh mục <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="categoryCode"
                className={`w-full p-2 border ${errors.categoryCode ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500`}
                value={categoryCode}
                onChange={(e) => setCategoryCode(e.target.value)}
                placeholder="Nhập mã danh mục (ví dụ: dental_care)"
              />
              {errors.categoryCode && (
                <p className="mt-1 text-sm text-red-500">{errors.categoryCode}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                className={`w-full p-2 border ${errors.description ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nhập mô tả về danh mục dịch vụ"
                rows="3"
              ></textarea>
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            <div className="flex justify-end pt-4 space-x-2">
              <button
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600"
              >
                {isEditMode ? "Cập nhật" : "Thêm mới"}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ServiceCategories;
