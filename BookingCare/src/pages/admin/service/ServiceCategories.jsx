import React, { useState } from "react";
import { Link } from "react-router-dom";
import Modal from "react-modal";

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
  const [isOpen, setIsOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!categoryName.trim()) {
      newErrors.categoryName = "Tên danh mục không được để trống";
    }
    if (!description.trim()) {
      newErrors.description = "Mô tả không được để trống";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // TODO: Implement API call to save category
      console.log({
        categoryName,
        description,
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setCategoryName("");
    setDescription("");
    setErrors({});
  };

  const categories = [
    {
      id: 1,
      name: "Chăm sóc da",
      code: "CSD001",
      description: "Các dịch vụ chăm sóc da cơ bản và chuyên sâu",
      serviceCount: 5,
    },
    {
      id: 2,
      name: "Điều trị",
      code: "DT002",
      description: "Các dịch vụ điều trị da chuyên sâu",
      serviceCount: 3,
    },
    {
      id: 3,
      name: "Trẻ hóa",
      code: "TH003",
      description: "Các dịch vụ trẻ hóa da và chống lão hóa",
      serviceCount: 2,
    },
    {
      id: 4,
      name: "Massage",
      code: "MS004",
      description: "Các dịch vụ massage mặt và cơ thể",
      serviceCount: 4,
    },
    {
      id: 5,
      name: "Làm đẹp",
      code: "LD005",
      description: "Các dịch vụ làm đẹp khác",
      serviceCount: 1,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Quản lý danh mục dịch vụ</h1>
        <span
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md cursor-pointer"
        >
          <i className="fas fa-plus-circle"></i>
          <span>Thêm danh mục</span>
        </span>
      </div>

      {/* Categories content */}
      <div className="bg-white rounded-md shadow-sm p-6">
        <h2 className="text-lg font-medium mb-4">Danh sách danh mục dịch vụ</h2>

        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên danh mục
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
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{category.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {category.description}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {category.serviceCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <span className="text-blue-500 hover:text-blue-700 bg-blue-100 hover:bg-blue-200 p-1 rounded mr-2 cursor-pointer">
                    <i className="fas fa-edit"></i>
                  </span>
                  <span className="text-red-500 hover:text-red-700 bg-red-100 hover:bg-red-200 p-1 rounded cursor-pointer ">
                    <i className="fas fa-trash-alt"></i>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isOpen} onRequestClose={handleClose} style={customStyles}>
        <div className="bg-white rounded-lg p-6 w-[500px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Thêm danh mục dịch vụ mới</h2>
            <span
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              <i className="fas fa-times"></i>
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Tạo danh mục dịch vụ mới để phân loại các dịch vụ.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">
                Tên danh mục *
              </label>
              <input
                className={`w-full border border-black/30 mt-1 p-2 rounded-md ${
                  errors.categoryName ? "border-red-500" : ""
                }`}
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Nhập tên danh mục"
              />
              {errors.categoryName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.categoryName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium">Mô tả *</label>
              <textarea
                className={`w-full border border-black/30 mt-1 p-2 rounded-md h-24 ${
                  errors.description ? "border-red-500" : ""
                }`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Nhập mô tả cho danh mục"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <span
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer"
              >
                Hủy
              </span>
              <span
                onClick={handleSubmit}
                className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md cursor-pointer"
              >
                Thêm danh mục
              </span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ServiceCategories;
