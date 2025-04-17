import React, { useState, useEffect, useContext, useRef } from "react";
import { Link } from "react-router-dom";
import SpecialistService from "../../../../services/SpecialistService";
import UserService from "../../../../services/UserService";
import Modal from "react-modal";
import { MessageContext } from "../../../contexts/MessageProvider.jsx";
import Pagination from "../../../components/Pagination";

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

const SpecialistList = () => {
  const message = useContext(MessageContext);

  // State cho dữ liệu từ API
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentSpecialist, setCurrentSpecialist] = useState(null);
  const [staffUsers, setStaffUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef(null);

  // State cho form thêm chuyên gia
  const [formData, setFormData] = useState({
    userId: "",
    specialty: "",
    qualification: "",
    experience: "",
    workingHours: "",
    biography: "",
    status: "ACTIVE",
    avatarUrl: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Tải dữ liệu khi component mount
  useEffect(() => {
    fetchSpecialists();
  }, []);

  // Hàm tải danh sách chuyên gia
  const fetchSpecialists = async () => {
    try {
      setLoading(true);
      const data = await SpecialistService.getAllSpecialists();
      setTotalItems(data.length);
      setSpecialists(data);
    } catch (error) {
      console.error("Error fetching specialists:", error);
      message.error("Không thể tải danh sách chuyên gia");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý xóa chuyên gia
  const handleDeleteSpecialist = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa chuyên gia này không?")) {
      try {
        await SpecialistService.deleteSpecialist(id);
        message.success("Xóa chuyên gia thành công");
        fetchSpecialists();
      } catch (error) {
        console.error("Error deleting specialist:", error);
        message.error("Có lỗi xảy ra khi xóa chuyên gia");
      }
    }
  };

  // Hiển thị số sao dựa trên rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = rating % 1 >= 0.5;

    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <i key={`full-${i}`} className="fas fa-star text-yellow-400"></i>
      );
    }

    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <i key="half" className="fas fa-star-half-alt text-yellow-400"></i>
      );
    }

    // Add empty stars
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <i key={`empty-${i}`} className="far fa-star text-yellow-400"></i>
      );
    }

    return (
      <div className="flex items-center">
        {stars}
        <span className="ml-1 text-sm text-gray-600">
          ({rating ? rating.toFixed(1) : "0.0"})
        </span>
      </div>
    );
  };

  // Lọc chuyên gia theo từ khóa tìm kiếm và trạng thái
  const filteredSpecialists = specialists.filter((specialist) => {
    const matchesSearch =
      searchTerm === "" ||
      (specialist.firstName + " " + specialist.lastName)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      specialist.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      specialist.qualification
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "" || specialist.status === statusFilter;

    return matchesSearch && matchesStatus;
  });
  console.log("specialists", specialists);

  // Add pagination logic
  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentItems = filteredSpecialists.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Xử lý thay đổi ô tìm kiếm
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Effect để tải danh sách nhân viên khi modal mở
  useEffect(() => {
    if (isOpen) {
      fetchStaffUsers();
    }
  }, [isOpen]);

  // Hàm tải danh sách nhân viên
  const fetchStaffUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await UserService.getAllStaff();
      console.log("response", response);
      setStaffUsers(response);
    } catch (error) {
      message.error(`Lỗi khi tải danh sách nhân viên: ${error.message}`);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Xử lý thay đổi input trong form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Xử lý thay đổi user trong dropdown
  const handleUserChange = (e) => {
    const userId = e.target.value;

    if (!userId) {
      setSelectedUser(null);
      setFormData((prev) => ({ ...prev, userId: "" }));
      return;
    }

    const selected = staffUsers.find((user) => user.id === userId);

    if (selected) {
      setSelectedUser({
        id: selected.id,
        name: `${selected.firstName || ""} ${selected.lastName || ""}`.trim(),
        email: selected.email,
        username: selected.username,
      });

      setFormData((prev) => ({ ...prev, userId }));
    }
  };

  // Reset form khi mở modal
  useEffect(() => {
    if (isOpen) {
      fetchStaffUsers();
      setFormData({
        userId: "",
        specialty: "",
        qualification: "",
        experience: "",
        workingHours: "",
        biography: "",
        status: "ACTIVE",
        avatarUrl: "",
      });
      setSelectedUser(null);
    }
  }, [isOpen]);

  // Xử lý submit form tạo chuyên gia
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    if (!formData.userId) {
      message.error("Vui lòng chọn nhân viên");
      return;
    }

    try {
      setIsSubmitting(true);

      // Upload image if exists
      if (imageFile) {
        const uploadResponse = await UserService.uploadImage(imageFile);
        if (uploadResponse) {
          console.log("Avatar image uploaded:", uploadResponse);
          // Create a copy of formData with the new avatarUrl
          const updatedFormData = {
            ...formData,
            avatarUrl: uploadResponse,
          };

          await SpecialistService.createSpecialist(updatedFormData);
          message.success("Tạo chuyên gia thành công");
          closeAddModal();
          fetchSpecialists();
          return; // Exit early as we've already created the specialist
        }
      }

      // If no image was uploaded, create specialist with current formData
      await SpecialistService.createSpecialist(formData);
      message.success("Tạo chuyên gia thành công");
      closeAddModal();
      fetchSpecialists();
    } catch (error) {
      console.error("Error creating specialist:", error);
      message.error(`Lỗi khi tạo chuyên gia: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xử lý mở modal xem chi tiết
  const handleViewSpecialist = (specialist) => {
    setCurrentSpecialist(specialist);
    setIsViewOpen(true);
  };

  // Xử lý mở modal chỉnh sửa
  const handleEditSpecialist = (specialist) => {
    setCurrentSpecialist(specialist);
    setFormData({
      userId: specialist.userId || "",
      specialty: specialist.specialty || "",
      qualification: specialist.qualification || "",
      experience: specialist.experience || "",
      workingHours: specialist.workingHours || "",
      biography: specialist.biography || "",
      status: specialist.status || "ACTIVE",
      avatarUrl: specialist.avatarUrl || "",
    });
    setImagePreview(specialist.avatarUrl || "");

    // Tìm thông tin user từ userId
    if (specialist.userId) {
      const user = {
        id: specialist.userId,
        name: `${specialist.firstName || ""} ${
          specialist.lastName || ""
        }`.trim(),
        email: specialist.email,
        username: specialist.username,
      };
      setSelectedUser(user);
    }

    setIsEditOpen(true);
    fetchStaffUsers();
  };

  // Xử lý submit form chỉnh sửa
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!currentSpecialist || !currentSpecialist.id) {
      message.error("Không tìm thấy thông tin chuyên gia để cập nhật");
      return;
    }

    try {
      setIsSubmitting(true);

      let updatedData = { ...formData };

      // Upload image if exists
      if (imageFile) {
        const uploadResponse = await UserService.uploadImage(imageFile);
        if (uploadResponse) {
          console.log("Avatar image uploaded:", uploadResponse);
          // Create a new object with updated avatar URL instead of using state
          updatedData = {
            ...formData,
            avatarUrl: uploadResponse,
          };
        }
      }

      console.log("Specialist data to update:", updatedData);

      await SpecialistService.updateSpecialist(
        currentSpecialist.id,
        updatedData
      );
      message.success("Cập nhật chuyên gia thành công");
      closeEditModal();
      fetchSpecialists();
    } catch (error) {
      console.error("Error updating specialist:", error);
      message.error(`Lỗi khi cập nhật chuyên gia: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xử lý tải lên ảnh
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const openAddModal = () => {
    // Reset form data
    setFormData({
      userId: "",
      specialty: "",
      qualification: "",
      experience: "",
      workingHours: "",
      biography: "",
      status: "ACTIVE",
      avatarUrl: "",
    });
    setImagePreview("");
    setImageFile(null);
    setSelectedUser(null);
    setIsOpen(true);
    fetchStaffUsers();
  };

  const closeAddModal = () => {
    setIsOpen(false);
    // Reset form data
    setFormData({
      userId: "",
      specialty: "",
      qualification: "",
      experience: "",
      workingHours: "",
      biography: "",
      status: "ACTIVE",
      avatarUrl: "",
    });
    setImagePreview("");
    setImageFile(null);
    setSelectedUser(null);
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
    // Reset form data
    setFormData({
      userId: "",
      specialty: "",
      qualification: "",
      experience: "",
      workingHours: "",
      biography: "",
      status: "ACTIVE",
      avatarUrl: "",
    });
    setCurrentSpecialist(null);
    setImagePreview("");
    setImageFile(null);
    setSelectedUser(null);
  };

  const closeViewModal = () => {
    setIsViewOpen(false);
    setCurrentSpecialist(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold mb-6">Quản lý chuyên gia</h1>
        <span
          onClick={openAddModal}
          className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md cursor-pointer"
        >
          <i className="fas fa-plus-circle"></i>
          <span>Thêm chuyên gia</span>
        </span>
      </div>

      {/* Search and filter bar */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-grow">
          <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          <input
            type="text"
            placeholder="Tìm kiếm chuyên gia..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>
        <div className="relative min-w-[200px]">
          <select
            className="w-full appearance-none border border-gray-300 rounded-md px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="INACTIVE">Tạm ngưng</option>
            <option value="ON_LEAVE">Đang nghỉ</option>
            <option value="TERMINATED">Đã chấm dứt</option>
          </select>
          <i className="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>
      </div>

      {/* Specialists table */}
      <div className="bg-white rounded-md shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                  Ảnh
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên chuyên gia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chuyên môn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đánh giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                    </div>
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Không tìm thấy chuyên gia nào
                  </td>
                </tr>
              ) : (
                currentItems.map((specialist) => (
                  <tr key={specialist.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                        {specialist.avatarUrl ? (
                          <img
                            src={specialist.avatarUrl}
                            alt={`${specialist.firstName} ${specialist.lastName}`}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/default-image.png";
                            }}
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-400">
                            <i className="fas fa-user text-2xl"></i>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {specialist.firstName} {specialist.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {specialist.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {specialist.specialty || "Chưa cập nhật"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {specialist.qualification || "Chưa cập nhật"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStars(specialist.rating)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${
                          specialist.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : ""
                        }
                        ${
                          specialist.status === "INACTIVE"
                            ? "bg-gray-100 text-gray-800"
                            : ""
                        }
                        ${
                          specialist.status === "ON_LEAVE"
                            ? "bg-yellow-100 text-yellow-800"
                            : ""
                        }
                        ${
                          specialist.status === "TERMINATED"
                            ? "bg-red-100 text-red-800"
                            : ""
                        }
                      `}
                      >
                        {specialist.status === "ACTIVE" && "Đang hoạt động"}
                        {specialist.status === "INACTIVE" && "Tạm ngưng"}
                        {specialist.status === "ON_LEAVE" && "Đang nghỉ"}
                        {specialist.status === "TERMINATED" && "Đã chấm dứt"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-1">
                        <span
                          onClick={() => handleViewSpecialist(specialist)}
                          className="text-cyan-500 hover:text-cyan-700 bg-cyan-100 hover:bg-cyan-200 p-1.5 rounded"
                        >
                          <i className="fas fa-eye"></i>
                        </span>
                        <span
                          onClick={() => handleEditSpecialist(specialist)}
                          className="text-blue-500 hover:text-blue-700 bg-blue-100 hover:bg-blue-200 p-1.5 rounded"
                        >
                          <i className="fas fa-edit"></i>
                        </span>
                        <span
                          onClick={() => handleDeleteSpecialist(specialist.id)}
                          className="text-red-500 hover:text-red-700 bg-red-100 hover:bg-red-200 p-1.5 rounded"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add pagination */}
      <Pagination
        currentPage={currentPage}
        totalItems={filteredSpecialists.length}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      />

      <Modal
        isOpen={isOpen}
        onRequestClose={closeAddModal}
        style={customStyles}
      >
        <div className="p-4 max-h-[90vh] overflow-y-auto scrollbar-hidden">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Thêm chuyên gia mới</h2>
            <span
              onClick={closeAddModal}
              className="text-gray-500 hover:text-gray-700"
            >
              <i className="fas fa-times"></i>
            </span>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Chọn nhân viên */}
            <div>
              <label
                htmlFor="userId"
                className="block text-sm font-medium text-gray-700 mb-1 required"
              >
                Chọn nhân viên
              </label>
              <select
                id="userId"
                name="userId"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500"
                disabled={isLoadingUsers}
                required
                value={formData.userId}
                onChange={handleUserChange}
              >
                <option value="">Chọn nhân viên</option>
                {staffUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {`${user.firstName || ""} ${user.lastName || ""} (${
                      user.email
                    })`}
                  </option>
                ))}
              </select>
              {isLoadingUsers && (
                <div className="mt-1 text-sm text-gray-500">
                  Đang tải danh sách nhân viên...
                </div>
              )}
            </div>

            {/* Display selected user info if any */}
            {selectedUser && (
              <div className="bg-gray-50 p-3 rounded-md">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Thông tin nhân viên đã chọn
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-xs text-gray-500 block">Họ tên:</span>
                    <span>{selectedUser.name || "Chưa có tên"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Email:</span>
                    <span>{selectedUser.email || "Chưa có email"}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Chuyên môn */}
              <div>
                <label
                  htmlFor="specialty"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Chuyên môn
                </label>
                <input
                  type="text"
                  id="specialty"
                  name="specialty"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500"
                  placeholder="Nhập chuyên môn của chuyên gia"
                  maxLength={100}
                  value={formData.specialty}
                  onChange={handleInputChange}
                />
              </div>

              {/* Bằng cấp/Chứng chỉ */}
              <div>
                <label
                  htmlFor="qualification"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Bằng cấp/Chứng chỉ
                </label>
                <input
                  type="text"
                  id="qualification"
                  name="qualification"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500"
                  placeholder="Nhập bằng cấp, chứng chỉ"
                  maxLength={255}
                  value={formData.qualification}
                  onChange={handleInputChange}
                />
              </div>

              {/* Kinh nghiệm */}
              <div>
                <label
                  htmlFor="experience"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Kinh nghiệm
                </label>
                <input
                  type="text"
                  id="experience"
                  name="experience"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500"
                  placeholder="Nhập số năm kinh nghiệm hoặc mô tả kinh nghiệm"
                  maxLength={100}
                  value={formData.experience}
                  onChange={handleInputChange}
                />
              </div>

              {/* Giờ làm việc */}
              <div>
                <label
                  htmlFor="workingHours"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Giờ làm việc
                </label>
                <input
                  type="text"
                  id="workingHours"
                  name="workingHours"
                  value={formData.workingHours}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500"
                  placeholder="Nhập giờ làm việc (ví dụ: 8:00 - 17:00)"
                  maxLength={255}
                />
              </div>
            </div>

            {/* Avatar URL */}
            <div>
              <label
                htmlFor="avatarUrl"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Ảnh đại diện
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:border-pink-500 transition-colors">
                <div className="flex items-center">
                  <input
                    type="text"
                    id="avatarUrl"
                    name="avatarUrl"
                    value={formData.avatarUrl}
                    onChange={handleInputChange}
                    className="flex-1 p-2 mr-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500"
                    placeholder="Nhập URL ảnh đại diện"
                  />
                  <span className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      ref={fileInputRef}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <span
                      type="span"
                      className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md text-gray-700"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Tải lên
                    </span>
                  </span>
                </div>

                <div className="text-sm text-gray-500 mt-2">
                  <p>Nhập URL ảnh hoặc tải lên ảnh từ máy tính</p>
                </div>

                {imagePreview && (
                  <div className="mt-2 relative w-32 h-32 mx-auto">
                    <img
                      src={imagePreview}
                      alt="Avatar Preview"
                      className="w-full h-full object-cover rounded-md"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/default-image.png";
                      }}
                    />
                    <span
                      type="span"
                      onClick={() => {
                        setImagePreview("");
                        setImageFile(null);
                        setFormData({ ...formData, avatarUrl: "" });
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 focus:outline-none"
                    >
                      <i className="fas fa-times text-sm"></i>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Trạng thái */}
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Trạng thái
              </label>
              <select
                id="status"
                name="status"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="ACTIVE">Đang hoạt động</option>
                <option value="INACTIVE">Tạm ngưng</option>
                <option value="ON_LEAVE">Đang nghỉ</option>
                <option value="TERMINATED">Đã chấm dứt</option>
              </select>
            </div>

            {/* Tiểu sử */}
            <div>
              <label
                htmlFor="biography"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tiểu sử
              </label>
              <textarea
                id="biography"
                name="biography"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500"
                placeholder="Nhập tiểu sử chi tiết của chuyên gia"
                rows={3}
                maxLength={1000}
                value={formData.biography}
                onChange={handleInputChange}
              ></textarea>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <span
                type="span"
                onClick={closeAddModal}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
                disabled={isSubmitting}
              >
                Hủy
              </span>
              <button
                type="submit"
                className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors cursor-pointer"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                    Đang xử lý...
                  </div>
                ) : (
                  "Tạo mới"
                )}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* View Specialist Modal */}
      <Modal
        isOpen={isViewOpen}
        onRequestClose={closeViewModal}
        style={customStyles}
      >
        {currentSpecialist && (
          <div className="p-4 max-h-[90vh] overflow-y-auto scrollbar-hidden">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Chi tiết chuyên gia</h2>
              <span
                onClick={closeViewModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fas fa-times"></i>
              </span>
            </div>

            <div className="space-y-6">
              {/* Thông tin cơ bản */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start border-b border-gray-200 pb-4">
                <div className="w-32 h-32 flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
                  <img
                    src={currentSpecialist.avatarUrl || "/default-image.png"}
                    alt={`${currentSpecialist.firstName || ""} ${
                      currentSpecialist.lastName || ""
                    }`}
                    className="w-full h-full object-cover rounded-full shadow"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/default-image.png";
                    }}
                  />
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    {`${currentSpecialist.firstName || ""} ${
                      currentSpecialist.lastName || ""
                    }`.trim() || "Chưa có tên"}
                  </h3>
                  <p className="text-pink-500 font-medium mb-3">
                    {currentSpecialist.specialty || "Chưa cập nhật chuyên môn"}
                  </p>

                  <div className="flex flex-wrap justify-center sm:justify-start gap-4 mb-4">
                    <div className="flex items-center text-gray-600">
                      <i className="fas fa-envelope mr-2"></i>
                      <span>{currentSpecialist.email || "Chưa cập nhật"}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <i className="fas fa-phone mr-2"></i>
                      <span>{currentSpecialist.phone || "Chưa cập nhật"}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center sm:justify-start gap-6">
                    <div>
                      <span className="text-sm text-gray-500 block mb-1">
                        Kinh nghiệm
                      </span>
                      <span className="font-medium">
                        {currentSpecialist.experience || "Chưa cập nhật"}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 block mb-1">
                        Đánh giá
                      </span>
                      {renderStars(currentSpecialist.rating)}
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 block mb-1">
                        Trạng thái
                      </span>
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          currentSpecialist.status === "ACTIVE"
                            ? "bg-green-100 text-green-800"
                            : currentSpecialist.status === "INACTIVE"
                            ? "bg-gray-100 text-gray-800"
                            : currentSpecialist.status === "ON_LEAVE"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {currentSpecialist.status === "ACTIVE"
                          ? "Đang hoạt động"
                          : currentSpecialist.status === "INACTIVE"
                          ? "Tạm ngưng"
                          : currentSpecialist.status === "ON_LEAVE"
                          ? "Đang nghỉ"
                          : "Đã chấm dứt"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thông tin chi tiết */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Thông tin chi tiết
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="mb-3">
                      <span className="text-sm text-gray-500 block mb-1">
                        ID người dùng
                      </span>
                      <span className="text-gray-700">
                        {currentSpecialist.userId || "N/A"}
                      </span>
                    </div>
                    <div className="mb-3">
                      <span className="text-sm text-gray-500 block mb-1">
                        Tài khoản
                      </span>
                      <span className="text-gray-700">
                        {currentSpecialist.username || "N/A"}
                      </span>
                    </div>
                    <div className="mb-3">
                      <span className="text-sm text-gray-500 block mb-1">
                        Bằng cấp/Chứng chỉ
                      </span>
                      <span className="text-gray-700">
                        {currentSpecialist.qualification || "Chưa cập nhật"}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 block mb-1">
                        Giờ làm việc
                      </span>
                      <span className="text-gray-700">
                        {currentSpecialist.workingHours || "Chưa cập nhật"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Mô tả/Tiểu sử
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 text-gray-700">
                    {currentSpecialist.biography ||
                      currentSpecialist.description ||
                      "Chưa có mô tả chi tiết về chuyên gia này."}
                  </div>
                </div>
              </div>

              {/* Ảnh bổ sung */}
              {currentSpecialist.images &&
                currentSpecialist.images.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Thư viện ảnh
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {currentSpecialist.images.map((image, index) => (
                        <div
                          key={index}
                          className="relative h-40 rounded-lg overflow-hidden bg-gray-100"
                        >
                          <img
                            src={image}
                            alt={`Ảnh ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/default-image.png";
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Các nút tác vụ */}
              <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
                <span
                  onClick={() => {
                    closeViewModal();
                    handleEditSpecialist(currentSpecialist);
                  }}
                  className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
                >
                  <i className="fas fa-edit mr-2"></i>
                  Chỉnh sửa
                </span>
                <span
                  onClick={closeViewModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Đóng
                </span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Specialist Modal */}
      <Modal
        isOpen={isEditOpen}
        onRequestClose={closeEditModal}
        style={customStyles}
      >
        {currentSpecialist && (
          <div className="p-4 max-h-[90vh] overflow-y-auto scrollbar-hidden ">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Chỉnh sửa chuyên gia</h2>
              <span
                onClick={closeEditModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <i className="fas fa-times"></i>
              </span>
            </div>

            <form className="space-y-4" onSubmit={handleEditSubmit}>
              {/* Thông tin user đã chọn */}
              {selectedUser && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Thông tin người dùng
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-xs text-gray-500 block">
                        Họ tên:
                      </span>
                      <span>{selectedUser.name || "Chưa có tên"}</span>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 block">
                        Email:
                      </span>
                      <span>{selectedUser.email || "Chưa có email"}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Chuyên môn */}
                <div>
                  <label
                    htmlFor="specialty-edit"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Chuyên môn
                  </label>
                  <input
                    type="text"
                    id="specialty-edit"
                    name="specialty"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500"
                    placeholder="Nhập chuyên môn của chuyên gia"
                    maxLength={100}
                    value={formData.specialty}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Bằng cấp/Chứng chỉ */}
                <div>
                  <label
                    htmlFor="qualification-edit"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Bằng cấp/Chứng chỉ
                  </label>
                  <input
                    type="text"
                    id="qualification-edit"
                    name="qualification"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500"
                    placeholder="Nhập bằng cấp, chứng chỉ"
                    maxLength={255}
                    value={formData.qualification}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Kinh nghiệm */}
                <div>
                  <label
                    htmlFor="experience-edit"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Kinh nghiệm
                  </label>
                  <input
                    type="text"
                    id="experience-edit"
                    name="experience"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500"
                    placeholder="Nhập số năm kinh nghiệm hoặc mô tả kinh nghiệm"
                    maxLength={100}
                    value={formData.experience}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Giờ làm việc */}
                <div>
                  <label
                    htmlFor="workingHours-edit"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Giờ làm việc
                  </label>
                  <input
                    type="text"
                    id="workingHours-edit"
                    name="workingHours"
                    value={formData.workingHours}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500"
                    placeholder="Nhập giờ làm việc (ví dụ: 8:00 - 17:00)"
                    maxLength={255}
                  />
                </div>
              </div>

              {/* Avatar URL */}
              <div>
                <label
                  htmlFor="avatarUrl-edit"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Ảnh đại diện
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center hover:border-pink-500 transition-colors">
                  <div className="flex items-center">
                    <input
                      type="text"
                      id="avatarUrl-edit"
                      name="avatarUrl"
                      value={formData.avatarUrl}
                      onChange={handleInputChange}
                      className="flex-1 p-2 mr-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500"
                      placeholder="Nhập URL ảnh đại diện"
                    />
                    <span className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        ref={fileInputRef}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <span
                        type="span"
                        className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md text-gray-700"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Tải lên
                      </span>
                    </span>
                  </div>

                  <div className="text-sm text-gray-500 mt-2">
                    <p>Nhập URL ảnh hoặc tải lên ảnh từ máy tính</p>
                  </div>

                  {imagePreview && (
                    <div className="mt-2 relative w-32 h-32 mx-auto">
                      <img
                        src={imagePreview}
                        alt="Avatar Preview"
                        className="w-full h-full object-cover rounded-md"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/default-image.png";
                        }}
                      />
                      <span
                        type="span"
                        onClick={() => {
                          setImagePreview("");
                          setImageFile(null);
                          setFormData({ ...formData, avatarUrl: "" });
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 focus:outline-none"
                      >
                        <i className="fas fa-times text-sm"></i>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Trạng thái */}
              <div>
                <label
                  htmlFor="status-edit"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Trạng thái
                </label>
                <select
                  id="status-edit"
                  name="status"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="ACTIVE">Đang hoạt động</option>
                  <option value="INACTIVE">Tạm ngưng</option>
                  <option value="ON_LEAVE">Đang nghỉ</option>
                  <option value="TERMINATED">Đã chấm dứt</option>
                </select>
              </div>

              {/* Tiểu sử */}
              <div>
                <label
                  htmlFor="biography-edit"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Tiểu sử
                </label>
                <textarea
                  id="biography-edit"
                  name="biography"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-pink-500"
                  placeholder="Nhập tiểu sử chi tiết của chuyên gia"
                  rows={3}
                  maxLength={1000}
                  value={formData.biography}
                  onChange={handleInputChange}
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <span
                  type="span"
                  onClick={closeEditModal}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
                  disabled={isSubmitting}
                >
                  Hủy
                </span>
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
                  ) : (
                    "Cập nhật"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SpecialistList;
