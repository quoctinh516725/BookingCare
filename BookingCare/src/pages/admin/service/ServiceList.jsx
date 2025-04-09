import React, { useState, useRef, useEffect, useContext } from "react";
import Modal from "react-modal";
import UserService from "../../../../services/UserService";
import ServiceCategoryService from "../../../../services/ServiceCategoryService";
import { MessageContext } from "../../../contexts/MessageProvider.jsx";

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
const ServiceList = () => {
  const message = useContext(MessageContext);
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
  
  // State cho dữ liệu từ API
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Thêm state để lưu file cần upload
  const [fileToUpload, setFileToUpload] = useState(null);

  // Tải dữ liệu khi component mount
  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, []);

  // Hàm tải danh sách dịch vụ
  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await UserService.getServices();
      setServices(data);
    } catch (error) {
      console.error("Error fetching services:", error);
      message.error("Không thể tải danh sách dịch vụ");
    } finally {
      setLoading(false);
    }
  };

  // Hàm tải danh mục dịch vụ
  const fetchCategories = async () => {
    try {
      const data = await ServiceCategoryService.getAllCategories();
      setCategories(data);
      // Tự động chọn danh mục đầu tiên nếu có
      if (data && data.length > 0) {
        setCategoryId(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      message.error("Không thể tải danh mục dịch vụ");
    }
  };

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
        // Upload ảnh nếu có file mới
        let imageUrlToSave = imageUrl;
        if (fileToUpload) {
          try {
            imageUrlToSave = await UserService.uploadImage(fileToUpload);
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
          categoryId
        };
        
        if (isEditMode) {
          await UserService.updateService(currentServiceId, serviceData);
          message.success("Cập nhật dịch vụ thành công");
        } else {
          await UserService.createService(serviceData);
          message.success("Thêm dịch vụ thành công");
        }
        
        // Tải lại danh sách dịch vụ
        fetchServices();
        handleClose();
      } catch (error) {
        console.error(isEditMode ? "Error updating service:" : "Error creating service:", error);
        const errorMessage = error.response?.data?.message || `Có lỗi xảy ra khi ${isEditMode ? "cập nhật" : "thêm"} dịch vụ`;
        message.error(errorMessage);
      }
    }
  };

  const handleEdit = (service) => {
    setIsEditMode(true);
    setCurrentServiceId(service.id);
    
    // Điền thông tin dịch vụ vào form
    setServiceName(service.name);
    setDescription(service.description);
    setPrice(service.price.toString());
    setDuration(service.duration.toString());
    setCategoryId(service.categoryId || "");
    setImageUrl(service.image || "");
    if (service.image) {
      setPreviewUrl(service.image);
    }
    
    // Mở modal
    setIsOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa dịch vụ này không?")) {
      try {
        await UserService.deleteService(id);
        message.success("Xóa dịch vụ thành công");
        // Tải lại danh sách dịch vụ
        fetchServices();
      } catch (error) {
        console.error("Error deleting service:", error);
        const errorMessage = error.response?.data?.message || "Có lỗi xảy ra khi xóa dịch vụ";
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
        setFileToUpload(file); // Lưu file để upload sau
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Quản lý dịch vụ</h1>
        <span
          onClick={() => {
            setIsEditMode(false);
            setCurrentServiceId(null);
            setIsOpen(true);
          }}
          className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md cursor-pointer"
        >
          <i className="fas fa-plus-circle"></i>
          <span>Thêm dịch vụ</span>
        </span>
      </div>

      {/* Search and filter bar */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-grow">
          <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          <input
            type="text"
            placeholder="Tìm kiếm dịch vụ..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>
        <div className="relative min-w-[200px]">
          <select 
            className="w-full appearance-none border border-gray-300 rounded-md px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            onChange={(e) => {
              const catId = e.target.value;
              if (catId) {
                UserService.getServices(catId).then(data => setServices(data));
              } else {
                fetchServices();
              }
            }}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <i className="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>
      </div>

      {/* Services table */}
      <div className="bg-white rounded-md shadow overflow-hidden">
        {loading ? (
          <div className="text-center py-8">
            <i className="fas fa-spinner fa-spin text-2xl text-pink-500"></i>
            <p className="mt-2">Đang tải dịch vụ...</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên dịch vụ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mô tả
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Danh mục
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giá
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {services.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    Không có dịch vụ nào
                  </td>
                </tr>
              ) : (
                services.map((service) => (
                  <tr key={service.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 max-w-[150px]">
                      <div className="truncate">{service.name}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                      <div className="line-clamp-2 whitespace-normal">{service.description}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-[120px]">
                      <div className="truncate">{service.categoryName || "Chưa phân loại"}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {service.duration} phút
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {service.price?.toLocaleString()} ₫
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-right">
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
        )}
      </div>
      <Modal isOpen={isOpen} onRequestClose={handleClose} style={customStyles}>
        <div className="bg-white rounded-lg p-6 w-[500px] max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              {isEditMode ? "Cập nhật dịch vụ" : "Thêm dịch vụ mới"}
            </h2>
            <span
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <i className="fas fa-times"></i>
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            {isEditMode 
              ? "Cập nhật thông tin chi tiết dịch vụ." 
              : "Nhập thông tin chi tiết để thêm dịch vụ mới vào hệ thống."}
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium">Tên dịch vụ *</label>
              <input
                className={`w-full border border-black/30 mt-1 p-2 rounded-md ${
                  errors.serviceName ? "border-red-500" : ""
                }`}
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="Nhập tên dịch vụ"
              />
              {errors.serviceName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.serviceName}
                </p>
              )}
            </div>
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium">Giá (VND) *</label>
                <input
                  className={`w-full border border-black/30 mt-1 p-2 rounded-md ${
                    errors.price ? "border-red-500" : ""
                  }`}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  type="number"
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                )}
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium">
                  Thời gian (phút) *
                </label>
                <input
                  className={`w-full border border-black/30 mt-1 p-2 rounded-md ${
                    errors.duration ? "border-red-500" : ""
                  }`}
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  type="number"
                />
                {errors.duration && (
                  <p className="text-red-500 text-sm mt-1">{errors.duration}</p>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium">Danh mục *</label>
              <select
                className={`w-full border border-black/30 mt-1 p-2 rounded-md ${
                  errors.category ? "border-red-500" : ""
                }`}
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Chọn danh mục</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category}</p>
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
                placeholder="Nhập mô tả dịch vụ"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Hình ảnh (tùy chọn)
              </label>
              <div
                className={`relative border-2 border-dashed rounded-lg p-4 text-center ${
                  isDragging
                    ? "border-pink-500 bg-pink-50"
                    : "border-gray-300 hover:border-pink-500"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleUpload}
                  accept="image/*"
                  className="hidden"
                />

                {previewUrl ? (
                  <div className="relative group">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-[150px] mx-auto rounded-lg object-contain"
                    />
                    <div className="absolute inset-0 bg-gray-500/30 bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewUrl("");
                          setImageUrl("");
                        }}
                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 py-4">
                    <i className="fas fa-cloud-upload-alt text-4xl text-gray-400"></i>
                    <div className="text-gray-600">
                      Kéo thả hình ảnh vào đây hoặc click để chọn file
                    </div>
                    <div className="text-sm text-gray-500">
                      Hỗ trợ: JPG, PNG, GIF
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 sticky bottom-0 bg-white pt-3 pb-1">
              <span
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Hủy
              </span>
              <span
                onClick={handleSubmit}
                className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md"
              >
                {isEditMode ? "Cập nhật" : "Thêm dịch vụ"}
              </span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ServiceList;
