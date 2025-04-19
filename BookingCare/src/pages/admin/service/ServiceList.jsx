import React, { useState, useRef, useEffect, useContext } from "react";
import Modal from "react-modal";
import UserService from "../../../../services/UserService";
import ServiceService from "../../../../services/ServiceService";
import { MessageContext } from "../../../contexts/MessageProvider.jsx";
import Pagination from "../../../components/Pagination";
import { useAdminServiceCache } from "../contexts/AdminServiceCacheContext";
import useImageCache from "../hooks/useImageCache";

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

const ServiceImage = ({ src, alt }) => {
  const { imgSrc, isLoading } = useImageCache(src, '', 0.8, 7 * 24 * 60 * 60 * 1000, 'service_img_');
  
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="w-5 h-5 border-2 border-gray-200 border-t-pink-500 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  return (
    <img
      src={imgSrc}
      alt={alt}
      className="w-full h-full object-cover"
      loading="lazy"
      decoding="async"
      fetchPriority="low"
    />
  );
};

const ServiceList = () => {
  const message = useContext(MessageContext);
  const { 
    services, 
    categories, 
    servicesLoading, 
    categoriesLoading, 
    invalidateServicesCache 
  } = useAdminServiceCache();

  const [isOpen, setIsOpen] = useState(false);
  const [serviceName, setServiceName] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentServiceId, setCurrentServiceId] = useState(null);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    // If categories have loaded and no categoryId is selected, set the first one
    if (categories && categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [services, categories, categoryId]);

  // Filtered services based on search term
  const filteredServices = searchTerm 
    ? services.filter(service => 
        service.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : services;

  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentItems = filteredServices.slice(indexOfFirstItem, indexOfLastItem);

  const validateForm = () => {
    const newErrors = {};
    if (!serviceName.trim()) {
      newErrors.serviceName = "Tên dịch vụ không được để trống";
    }
    if (!price || price <= 0) {
      newErrors.price = "Giá dịch vụ phải lớn hơn 0";
    }
    if (!duration || duration <= 0) {
      newErrors.duration = "Thời gian dịch vụ phải lớn hơn 0";
    }
    if (!description.trim()) {
      newErrors.description = "Mô tả dịch vụ không được để trống";
    }
    if (!categoryId) {
      newErrors.category = "Vui lòng chọn danh mục dịch vụ";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        let imageUrlToSave = imageUrl;
        if (fileToUpload) {
          try {
            imageUrlToSave = await ServiceService.uploadServiceImage(
              fileToUpload
            );
          } catch (error) {
            console.error("Error uploading image:", error);
            message.error("Không thể tải ảnh lên, vui lòng thử lại");
            return;
          }
        }

        const serviceData = {
          name: serviceName,
          description,
          price: parseFloat(price),
          duration: parseInt(duration),
          image: imageUrlToSave,
          isActive: true,
          categoryId,
        };

        if (isEditMode) {
          await ServiceService.updateService(currentServiceId, serviceData);
          message.success("Cập nhật dịch vụ thành công");
        } else {
          await ServiceService.createService(serviceData);
          message.success("Thêm dịch vụ thành công");
        }

        // Invalidate and refresh services cache after changes
        invalidateServicesCache();
        handleClose();
      } catch (error) {
        console.error(
          isEditMode ? "Error updating service:" : "Error creating service:",
          error
        );
        const errorMessage =
          error.response?.data?.message ||
          `Có lỗi xảy ra khi ${isEditMode ? "cập nhật" : "thêm"} dịch vụ`;
        message.error(errorMessage);
      }
    }
  };

  const handleEdit = (service) => {
    setIsEditMode(true);
    setCurrentServiceId(service.id);
    setServiceName(service.name);
    setDescription(service.description);
    setPrice(service.price.toString());
    setDuration(service.duration.toString());
    setCategoryId(service.categoryId || "");
    setImageUrl(service.image || "");
    if (service.image) {
      setPreviewUrl(service.image);
    }
    setIsOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa dịch vụ này không?")) {
      try {
        await ServiceService.deleteService(id);
        message.success("Xóa dịch vụ thành công");
        
        // Invalidate and refresh services cache after delete
        invalidateServicesCache();
      } catch (error) {
        console.error("Error deleting service:", error);
        const errorMessage =
          error.response?.data?.message || "Có lỗi xảy ra khi xóa dịch vụ";
        message.error(errorMessage);
      }
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setServiceName("");
    setPrice("");
    setDuration("");
    setCategoryId(categories.length > 0 ? categories[0].id : "");
    setDescription("");
    setImageUrl("");
    setPreviewUrl("");
    setFileToUpload(null);
    setErrors({});
    setIsEditMode(false);
    setCurrentServiceId(null);
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleFile = (file) => {
    if (file) {
      if (file.type.startsWith("image/")) {
        setFileToUpload(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        message.error("Vui lòng chọn file hình ảnh");
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Force refresh function for manual data refresh
  const handleRefreshData = () => {
    invalidateServicesCache();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Quản lý dịch vụ</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleRefreshData}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer"
          >
            <i className="fas fa-sync-alt"></i>
            <span>Làm mới</span>
          </button>
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md cursor-pointer"
          >
            <i className="fas fa-plus-circle"></i>
            <span>Thêm dịch vụ</span>
          </button>
        </div>
      </div>

      {/* Filter and search */}
      <div className="mb-6 bg-white p-4 rounded-md shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm dịch vụ
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                <i className="fas fa-search"></i>
              </span>
              <input
                type="text"
                id="search"
                className="pl-10 w-full p-2 border border-gray-300 rounded-md"
                placeholder="Nhập tên dịch vụ..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page when searching
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Services list */}
      <div className="bg-white rounded-md shadow-sm p-6">
        <h2 className="text-lg font-medium mb-4">Danh sách dịch vụ</h2>

        {servicesLoading ? (
          <div className="text-center py-4">
            <i className="fas fa-spinner fa-spin text-2xl text-pink-500"></i>
            <p className="mt-2">Đang tải dịch vụ...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hình ảnh
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên dịch vụ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Danh mục
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giá
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thời gian
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                        {searchTerm
                          ? "Không tìm thấy dịch vụ phù hợp"
                          : "Chưa có dịch vụ nào"}
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((service) => (
                      <tr key={service.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100">
                            {service.image ? (
                              <ServiceImage src={service.image} alt={service.name} />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                                <i className="fas fa-image text-xl"></i>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {service.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {categories.find(cat => cat.id === service.categoryId)?.name || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND",
                          }).format(service.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {service.duration} phút
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <span
                            className="text-blue-500 hover:text-blue-700 bg-blue-100 hover:bg-blue-200 p-1 rounded mr-2 cursor-pointer"
                            onClick={() => handleEdit(service)}
                          >
                            <i className="fas fa-edit"></i>
                          </span>
                          <span
                            className="text-red-500 hover:text-red-700 bg-red-100 hover:bg-red-200 p-1 rounded cursor-pointer"
                            onClick={() => handleDelete(service.id)}
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
            {/* Pagination */}
            {filteredServices.length > pageSize && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalItems={filteredServices.length}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Service modal for create/edit */}
      <Modal isOpen={isOpen} onRequestClose={handleClose} style={customStyles}>
        <div className="bg-white rounded-lg p-6 w-[600px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              {isEditMode ? "Cập nhật dịch vụ" : "Thêm dịch vụ mới"}
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
              ? "Cập nhật thông tin dịch vụ hiện có"
              : "Thêm dịch vụ mới vào hệ thống"}
          </p>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="serviceName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tên dịch vụ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="serviceName"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className={`w-full p-2 border ${
                  errors.serviceName ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500`}
                placeholder="Nhập tên dịch vụ"
              />
              {errors.serviceName && (
                <p className="mt-1 text-sm text-red-500">{errors.serviceName}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Danh mục dịch vụ <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className={`w-full p-2 border ${
                    errors.category ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500`}
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categoriesLoading ? (
                    <option disabled>Đang tải danh mục...</option>
                  ) : (
                    categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))
                  )}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-500">{errors.category}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Giá dịch vụ (VNĐ) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className={`w-full p-2 border ${
                    errors.price ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500`}
                  placeholder="Giá dịch vụ"
                  min="0"
                />
                {errors.price && (
                  <p className="mt-1 text-sm text-red-500">{errors.price}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="duration"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Thời gian (phút) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className={`w-full p-2 border ${
                    errors.duration ? "border-red-500" : "border-gray-300"
                  } rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500`}
                  placeholder="Thời gian thực hiện"
                  min="1"
                  max="480"
                />
                {errors.duration && (
                  <p className="mt-1 text-sm text-red-500">{errors.duration}</p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mô tả dịch vụ <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full p-2 border ${
                  errors.description ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500`}
                placeholder="Nhập mô tả chi tiết về dịch vụ"
                rows="4"
              ></textarea>
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            <div>
              <p className="block text-sm font-medium text-gray-700 mb-1">
                Hình ảnh dịch vụ
              </p>
              <div
                className={`border-2 border-dashed p-4 rounded-md flex flex-col items-center justify-center cursor-pointer ${
                  isDragging ? "border-pink-500 bg-pink-50" : "border-gray-300"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
              >
                {previewUrl ? (
                  <div className="w-full">
                    {previewUrl.startsWith('data:') ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-32 h-32 object-cover mx-auto mb-2 rounded-md"
                      />
                    ) : (
                      <div className="w-32 h-32 mx-auto mb-2">
                        <ServiceImage src={previewUrl} alt="Preview" />
                      </div>
                    )}
                    <p className="text-xs text-center text-gray-500">
                      Nhấp hoặc kéo thả để thay đổi ảnh
                    </p>
                  </div>
                ) : (
                  <>
                    <i className="fas fa-cloud-upload-alt text-2xl text-gray-400 mb-2"></i>
                    <p className="text-sm text-center text-gray-500">
                      Nhấp vào đây hoặc kéo thả file ảnh
                    </p>
                  </>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleUpload}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
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

export default ServiceList;
