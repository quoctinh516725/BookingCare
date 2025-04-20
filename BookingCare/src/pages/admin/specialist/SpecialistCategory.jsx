import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { useContext } from "react";
import { MessageContext } from "../../../contexts/MessageProvider.jsx";
import { useAdminSpecialistCache } from "../contexts/AdminSpecialistCacheContext.jsx";
import SpecialistCategoryService from "../../../../services/SpecialistCategoryService";

// Đảm bảo modal hoạt động tốt với screen reader
Modal.setAppElement("#root");

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

const SpecialistCategories = () => {
  const message = useContext(MessageContext);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryCode, setCategoryCode] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});
  const [currentCategoryId, setCurrentCategoryId] = useState(null);
  
  // Use the context for state management
  const { 
    specialistCategories, 
    specialistCategoriesLoading, 
    invalidateSpecialistCategoriesCache,
    loadSpecialistCategories
  } = useAdminSpecialistCache();

  // Tải danh sách danh mục khi component mount if not already loaded
  useEffect(() => {
    if (!specialistCategories) {
      loadSpecialistCategories();
    }
  }, [specialistCategories, loadSpecialistCategories]);

  const validateForm = () => {
    const newErrors = {};
    if (!categoryName.trim()) {
      newErrors.categoryName = "Tên danh mục không được để trống";
    }

    if (!categoryCode.trim()) {
      newErrors.categoryCode = "Mã danh mục không được để trống";
    } else if (!/^[A-Za-z0-9_-]+$/.test(categoryCode)) {
      newErrors.categoryCode =
        "Mã danh mục chỉ chứa chữ cái, số, gạch ngang và gạch dưới";
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
          isActive: true,
        };

        if (isEditMode) {
          await SpecialistCategoryService.updateCategory(
            currentCategoryId,
            categoryData
          );
          message.success("Cập nhật danh mục chuyên viên thành công");
        } else {
          await SpecialistCategoryService.createCategory(categoryData);
          message.success("Thêm danh mục chuyên viên thành công");
        }

        // Invalidate cache after successful operation
        invalidateSpecialistCategoriesCache();
        handleClose();
      } catch (error) {
        console.error("Error saving specialist category:", error);
        const errorMessage =
          error.response?.data?.message ||
          "Có lỗi xảy ra khi lưu danh mục chuyên viên";
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
    if (
      window.confirm("Bạn có chắc chắn muốn xóa danh mục chuyên viên này không?")
    ) {
      try {
        await SpecialistCategoryService.deleteCategory(id);
        message.success("Xóa danh mục chuyên viên thành công");
        // Invalidate cache after successful delete
        invalidateSpecialistCategoriesCache();
      } catch (error) {
        console.error("Error deleting specialist category:", error);
        const errorMessage =
          error.response?.data?.message ||
          "Có lỗi xảy ra khi xóa danh mục chuyên viên";
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold mb-6">Quản lý danh mục chuyên viên</h1>
        <span
          onClick={handleOpenModal}
          className="flex items-center gap-2 bg-[var(--primary-color)] hover:bg-[var(--primary-color)] text-white px-4 py-2 rounded-md cursor-pointer"
        >
          <i className="fas fa-plus-circle"></i>
          <span>Thêm danh mục</span>
        </span>
      </div>

      {/* Categories content */}
      <div className="bg-white rounded-md shadow-sm p-6">
        <h2 className="text-lg font-medium mb-4">
          Danh sách danh mục chuyên viên
        </h2>

        {specialistCategoriesLoading ? (
          <div className="text-center py-4">
            <i className="fas fa-spinner fa-spin text-2xl text-blue-500"></i>
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
                    Số chuyên viên
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {!specialistCategories || specialistCategories.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      Không có danh mục nào
                    </td>
                  </tr>
                ) : (
                  specialistCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {category.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">
                        {category.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {category.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {category.specialistCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="text-blue-500 hover:text-blue-700 bg-blue-100 hover:bg-blue-200 p-1 rounded mr-2 cursor-pointer"
                          onClick={() => handleEdit(category)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="text-red-500 hover:text-red-700 bg-red-100 hover:bg-red-200 p-1 rounded cursor-pointer"
                          onClick={() => handleDelete(category.id)}
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      <Modal
        isOpen={isOpen}
        onRequestClose={handleClose}
        style={customStyles}
        contentLabel="Specialist Category Modal"
      >
        <div className="min-w-[500px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {isEditMode
                ? "Cập nhật danh mục chuyên viên"
                : "Thêm danh mục chuyên viên"}
            </h2>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={handleClose}
            >
              <i className="fas fa-times text-lg"></i>
            </button>
          </div>

          <div className="space-y-4">
            {/* Category Name */}
            <div>
              <label
                htmlFor="categoryName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tên danh mục <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="categoryName"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.categoryName ? "border-red-500" : ""
                }`}
                placeholder="Nhập tên danh mục"
              />
              {errors.categoryName && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.categoryName}
                </p>
              )}
            </div>

            {/* Category Code */}
            <div>
              <label
                htmlFor="categoryCode"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mã danh mục <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="categoryCode"
                value={categoryCode}
                onChange={(e) => setCategoryCode(e.target.value)}
                className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.categoryCode ? "border-red-500" : ""
                }`}
                placeholder="Nhập mã danh mục (VD: CARDIOLOGY, NEUROLOGY)"
              />
              {errors.categoryCode && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.categoryCode}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mô tả <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.description ? "border-red-500" : ""
                }`}
                rows="3"
                placeholder="Nhập mô tả danh mục"
              ></textarea>
              {errors.description && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.description}
                </p>
              )}
            </div>

            <div className="flex justify-end pt-4 space-x-3">
              <button
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                onClick={handleClose}
              >
                Hủy
              </button>
              <button
                className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-md hover:bg-[var(--primary-dark-color)]"
                onClick={handleSubmit}
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

export default SpecialistCategories;