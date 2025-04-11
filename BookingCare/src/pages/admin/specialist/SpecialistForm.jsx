import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import SpecialistService from "../../../../services/SpecialistService";
import UserService from "../../../../services/UserService";
import { MessageContext } from "../../../contexts/MessageProvider";

const SpecialistForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const message = useContext(MessageContext);
  const queryClient = useQueryClient();
  const isEditMode = !!id;
  const fileInputRef = useRef(null);
  const additionalImageInputRef = useRef(null);

  // State cho form
  const [formData, setFormData] = useState({
    userId: "",
    specialty: "",
    qualification: "",
    experience: "",
    avatarUrl: "",
    workingHours: "",
    biography: "",
    images: [],
    status: "ACTIVE"
  });

  // State cho danh sách staff users
  const [staffUsers, setStaffUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // State cho xử lý ảnh
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [isDraggingAvatar, setIsDraggingAvatar] = useState(false);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isDraggingImage, setIsDraggingImage] = useState(false);

  // Query để lấy dữ liệu chuyên gia khi ở chế độ chỉnh sửa
  const { isLoading: isLoadingSpecialist } = useQuery({
    queryKey: ["specialist", id],
    queryFn: () => SpecialistService.getSpecialistById(id),
    enabled: isEditMode,
    onSuccess: (data) => {
      setFormData({
        userId: data.userId || "",
        specialty: data.specialty || "",
        qualification: data.qualification || "",
        experience: data.experience || "",
        avatarUrl: data.avatarUrl || "",
        workingHours: data.workingHours || "",
        biography: data.biography || "",
        images: data.images || [],
        status: data.status || "ACTIVE"
      });

      // Thiết lập preview cho avatar
      if (data.avatarUrl) {
        setAvatarPreview(data.avatarUrl);
      }

      // Thiết lập previews cho images bổ sung
      if (data.images && data.images.length > 0) {
        setImagePreviews(data.images);
      }

      // Lưu thông tin user đã chọn
      setSelectedUser({
        id: data.userId,
        name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
        email: data.email,
        username: data.username
      });
    },
    onError: (error) => {
      message.error(`Lỗi khi tải thông tin chuyên gia: ${error.message}`);
    }
  });

  // Lấy danh sách staff users
  useEffect(() => {
    const fetchStaffUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const response = await UserService.getStaff();
        setStaffUsers(response);
      } catch (error) {
        message.error(`Lỗi khi tải danh sách nhân viên: ${error.message}`);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchStaffUsers();
  }, [message]);

  // Xử lý upload avatar
  const handleAvatarUpload = async () => {
    if (!avatarFile) return formData.avatarUrl;
    
    try {
      const uploadResponse = await UserService.uploadImage(avatarFile);
      return uploadResponse;
    } catch (error) {
      message.error("Lỗi khi tải lên ảnh đại diện");
      console.error("Lỗi upload avatar:", error);
      return formData.avatarUrl;
    }
  };
  
  // Xử lý upload các ảnh bổ sung
  const handleAdditionalImagesUpload = async () => {
    const currentImages = [...formData.images];
    
    if (additionalImages.length === 0) return currentImages;
    
    try {
      const uploadPromises = additionalImages.map(file => 
        UserService.uploadImage(file)
      );
      
      const uploadedUrls = await Promise.all(uploadPromises);
      return [...currentImages, ...uploadedUrls];
    } catch (error) {
      message.error("Lỗi khi tải lên một số hình ảnh bổ sung");
      console.error("Lỗi upload images:", error);
      return currentImages;
    }
  };

  // Mutation để tạo mới chuyên gia
  const createMutation = useMutation({
    mutationFn: async (data) => {
      // Upload avatar trước nếu có
      const avatarUrl = await handleAvatarUpload();
      
      // Upload các ảnh bổ sung nếu có
      const imageUrls = await handleAdditionalImagesUpload();
      
      // Kết hợp dữ liệu
      const finalData = {
        ...data,
        avatarUrl,
        images: imageUrls
      };
      
      return SpecialistService.createSpecialist(finalData);
    },
    onSuccess: () => {
      message.success("Tạo chuyên gia thành công");
      queryClient.invalidateQueries({ queryKey: ["specialists"] });
      navigate("/admin/specialists");
    },
    onError: (error) => {
      message.error(`Lỗi khi tạo chuyên gia: ${error.message}`);
    }
  });

  // Mutation để cập nhật chuyên gia
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      // Upload avatar trước nếu có
      const avatarUrl = await handleAvatarUpload();
      
      // Upload các ảnh bổ sung nếu có
      const imageUrls = await handleAdditionalImagesUpload();
      
      // Kết hợp dữ liệu
      const finalData = {
        ...data,
        avatarUrl,
        images: imageUrls
      };
      
      return SpecialistService.updateSpecialist(id, finalData);
    },
    onSuccess: () => {
      message.success("Cập nhật chuyên gia thành công");
      queryClient.invalidateQueries({ queryKey: ["specialists"] });
      queryClient.invalidateQueries({ queryKey: ["specialist", id] });
      navigate("/admin/specialists");
    },
    onError: (error) => {
      message.error(`Lỗi khi cập nhật chuyên gia: ${error.message}`);
    }
  });

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Xử lý thay đổi user
  const handleUserChange = (e) => {
    const userId = e.target.value;
    
    if (!userId) {
      setSelectedUser(null);
      setFormData(prev => ({ ...prev, userId: "" }));
      return;
    }

    const selected = staffUsers.find(user => user.id === userId);
    
    if (selected) {
      setSelectedUser({
        id: selected.id,
        name: `${selected.firstName || ''} ${selected.lastName || ''}`.trim(),
        email: selected.email,
        username: selected.username
      });
      
      setFormData(prev => ({ ...prev, userId }));
    }
  };

  // Xử lý kéo thả và chọn avatar
  const handleAvatarDragOver = (e) => {
    e.preventDefault();
    setIsDraggingAvatar(true);
  };

  const handleAvatarDragLeave = (e) => {
    e.preventDefault();
    setIsDraggingAvatar(false);
  };

  const handleAvatarDrop = (e) => {
    e.preventDefault();
    setIsDraggingAvatar(false);
    const file = e.dataTransfer.files[0];
    handleAvatarFile(file);
  };

  const handleAvatarFileSelect = (e) => {
    const file = e.target.files[0];
    handleAvatarFile(file);
  };

  const handleAvatarFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else if (file) {
      message.error("Vui lòng chọn file hình ảnh cho avatar");
    }
  };

  // Xử lý kéo thả và chọn ảnh bổ sung
  const handleImageDragOver = (e) => {
    e.preventDefault();
    setIsDraggingImage(true);
  };

  const handleImageDragLeave = (e) => {
    e.preventDefault();
    setIsDraggingImage(false);
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    setIsDraggingImage(false);
    const files = Array.from(e.dataTransfer.files);
    handleImageFiles(files);
  };

  const handleImageFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleImageFiles(files);
  };

  const handleImageFiles = (files) => {
    const imageFiles = files.filter(file => file.type.startsWith("image/"));
    
    if (imageFiles.length > 0) {
      setAdditionalImages(prev => [...prev, ...imageFiles]);
      
      const newPreviews = imageFiles.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result);
          };
          reader.readAsDataURL(file);
        });
      });
      
      Promise.all(newPreviews).then(results => {
        setImagePreviews(prev => [...prev, ...results]);
      });
    }
    
    if (files.length !== imageFiles.length) {
      message.error("Chỉ chấp nhận file hình ảnh. Một số file không phải ảnh đã bị bỏ qua.");
    }
  };

  // Xóa ảnh bổ sung
  const handleRemoveImage = (index) => {
    const existingImages = formData.images || [];
    
    // Xác định xem ảnh nằm trong dữ liệu gốc hay mới thêm
    if (index < existingImages.length) {
      // Xóa ảnh từ dữ liệu gốc
      const newImages = [...existingImages];
      newImages.splice(index, 1);
      
      setFormData(prev => ({
        ...prev,
        images: newImages
      }));
      
      setImagePreviews(prev => {
        const newPreviews = [...prev];
        newPreviews.splice(index, 1);
        return newPreviews;
      });
    } else {
      // Xóa ảnh từ danh sách mới thêm
      const newIndex = index - existingImages.length;
      
      setAdditionalImages(prev => {
        const newFiles = [...prev];
        newFiles.splice(newIndex, 1);
        return newFiles;
      });
      
      setImagePreviews(prev => {
        const newPreviews = [...prev];
        newPreviews.splice(index, 1);
        return newPreviews;
      });
    }
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    if (!formData.userId) {
      message.error("Vui lòng chọn nhân viên");
      return;
    }

    if (isEditMode) {
      updateMutation.mutate({ id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  // Xử lý hủy
  const handleCancel = () => {
    navigate("/admin/specialists");
  };

  // Loading state
  if (isEditMode && isLoadingSpecialist) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
          <p className="mt-3 text-gray-700">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center mb-6">
            <button
              onClick={handleCancel}
              className="mr-4 text-gray-500 hover:text-pink-500 transition-colors"
            >
              <i className="fas fa-arrow-left text-xl"></i>
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              {isEditMode ? "Chỉnh sửa chuyên gia" : "Thêm chuyên gia mới"}
            </h1>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <form onSubmit={handleSubmit}>
              <div className="p-6 sm:p-8">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Thông tin cơ bản</h2>
                  
                  <div className="mb-4">
                    <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1 required">
                      Chọn nhân viên
                    </label>
                    <select
                      id="userId"
                      name="userId"
                      value={formData.userId}
                      onChange={handleUserChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500"
                      disabled={isEditMode || isLoadingUsers}
                      required
                    >
                      <option value="">Chọn nhân viên</option>
                      {staffUsers.map(user => (
                        <option key={user.id} value={user.id}>
                          {`${user.firstName || ''} ${user.lastName || ''} (${user.email})`}
                        </option>
                      ))}
                    </select>
                    {isLoadingUsers && (
                      <div className="mt-1 text-sm text-gray-500">Đang tải danh sách nhân viên...</div>
                    )}
                  </div>

                  {selectedUser && (
                    <div className="bg-gray-50 p-4 rounded-md mb-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Thông tin nhân viên đã chọn</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <span className="text-xs text-gray-500 block">Họ tên:</span>
                          <span className="text-sm">{selectedUser.name || "Chưa có tên"}</span>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 block">Email:</span>
                          <span className="text-sm">{selectedUser.email || "Chưa có email"}</span>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 block">Tài khoản:</span>
                          <span className="text-sm">{selectedUser.username || "Chưa có tài khoản"}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-1">
                      Chuyên môn
                    </label>
                    <input
                      type="text"
                      id="specialty"
                      name="specialty"
                      value={formData.specialty}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500"
                      placeholder="Nhập chuyên môn của chuyên gia"
                      maxLength={100}
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="qualification" className="block text-sm font-medium text-gray-700 mb-1">
                      Bằng cấp/Chứng chỉ
                    </label>
                    <input
                      type="text"
                      id="qualification"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500"
                      placeholder="Nhập bằng cấp, chứng chỉ"
                      maxLength={255}
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                      Kinh nghiệm
                    </label>
                    <input
                      type="text"
                      id="experience"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500"
                      placeholder="Nhập số năm kinh nghiệm hoặc mô tả kinh nghiệm"
                      maxLength={100}
                    />
                  </div>

                  {/* Upload Avatar */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ảnh đại diện
                    </label>
                    <div
                      className={`relative border-2 border-dashed rounded-lg p-4 text-center ${
                        isDraggingAvatar
                          ? "border-pink-500 bg-pink-50"
                          : "border-gray-300 hover:border-pink-500"
                      }`}
                      onDragOver={handleAvatarDragOver}
                      onDragLeave={handleAvatarDragLeave}
                      onDrop={handleAvatarDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleAvatarFileSelect}
                        accept="image/*"
                        className="hidden"
                      />

                      {avatarPreview ? (
                        <div className="relative group">
                          <img
                            src={avatarPreview}
                            alt="Avatar Preview"
                            className="max-h-[200px] mx-auto rounded-lg object-contain"
                          />
                          <div className="absolute inset-0 bg-gray-500/30 bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setAvatarPreview("");
                                setAvatarFile(null);
                                setFormData(prev => ({...prev, avatarUrl: ""}));
                              }}
                              className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2 py-4">
                          <i className="fas fa-user-circle text-4xl text-gray-400"></i>
                          <div className="text-gray-600">
                            Kéo thả ảnh đại diện vào đây hoặc click để chọn file
                          </div>
                          <div className="text-sm text-gray-500">
                            Hỗ trợ: JPG, PNG, GIF (tối đa 5MB)
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upload Additional Images */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ảnh bổ sung (tối đa 5 ảnh)
                    </label>
                    <div
                      className={`relative border-2 border-dashed rounded-lg p-4 text-center ${
                        isDraggingImage
                          ? "border-pink-500 bg-pink-50"
                          : "border-gray-300 hover:border-pink-500"
                      }`}
                      onDragOver={handleImageDragOver}
                      onDragLeave={handleImageDragLeave}
                      onDrop={handleImageDrop}
                      onClick={() => additionalImageInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        ref={additionalImageInputRef}
                        onChange={handleImageFileSelect}
                        accept="image/*"
                        multiple
                        className="hidden"
                      />

                      <div className="space-y-2 py-4">
                        <i className="fas fa-images text-4xl text-gray-400"></i>
                        <div className="text-gray-600">
                          Kéo thả hình ảnh vào đây hoặc click để chọn file
                        </div>
                        <div className="text-sm text-gray-500">
                          Hỗ trợ: JPG, PNG, GIF (tối đa 5MB mỗi ảnh)
                        </div>
                      </div>
                    </div>

                    {/* Preview Images Grid */}
                    {imagePreviews.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group rounded-lg overflow-hidden h-32">
                            <img
                              src={preview}
                              alt={`Image ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className="bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600"
                              >
                                <i className="fas fa-trash text-sm"></i>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <label htmlFor="workingHours" className="block text-sm font-medium text-gray-700 mb-1">
                      Giờ làm việc
                    </label>
                    <input
                      type="text"
                      id="workingHours"
                      name="workingHours"
                      value={formData.workingHours}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500"
                      placeholder="Nhập giờ làm việc (ví dụ: 8:00 - 17:00)"
                      maxLength={255}
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Trạng thái
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500"
                    >
                      <option value="ACTIVE">Đang hoạt động</option>
                      <option value="INACTIVE">Tạm ngưng</option>
                      <option value="ON_LEAVE">Đang nghỉ</option>
                      <option value="TERMINATED">Đã chấm dứt</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="biography" className="block text-sm font-medium text-gray-700 mb-1">
                      Tiểu sử
                    </label>
                    <textarea
                      id="biography"
                      name="biography"
                      value={formData.biography}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500"
                      placeholder="Nhập tiểu sử chi tiết của chuyên gia"
                      rows={5}
                      maxLength={1000}
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="px-6 sm:px-8 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors mr-3"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <div className="flex items-center">
                      <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                      Đang xử lý...
                    </div>
                  ) : isEditMode ? "Cập nhật" : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialistForm; 