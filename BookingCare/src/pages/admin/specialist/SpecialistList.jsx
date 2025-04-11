import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import SpecialistService from "../../../../services/SpecialistService";
import UserService from "../../../../services/UserService";
import { MessageContext } from "../../../contexts/MessageProvider.jsx";
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

const SpecialistList = () => {
  const message = useContext(MessageContext);
  
  // State cho dữ liệu từ API
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [staffUsers, setStaffUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  
  // State cho form thêm chuyên gia
  const [formData, setFormData] = useState({
    userId: "",
    specialty: "",
    qualification: "",
    experience: "",
    workingHours: "",
    biography: "",
    status: "ACTIVE"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Tải dữ liệu khi component mount
  useEffect(() => {
    fetchSpecialists();
  }, []);

  // Hàm tải danh sách chuyên gia
  const fetchSpecialists = async () => {
    try {
      setLoading(true);
      const data = await SpecialistService.getAllSpecialists();
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
      stars.push(<i key={`full-${i}`} className="fas fa-star text-yellow-400"></i>);
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<i key="half" className="fas fa-star-half-alt text-yellow-400"></i>);
    }
    
    // Add empty stars
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-${i}`} className="far fa-star text-yellow-400"></i>);
    }
    
    return (
      <div className="flex items-center">
        {stars}
        <span className="ml-1 text-sm text-gray-600">({rating ? rating.toFixed(1) : "0.0"})</span>
      </div>
    );
  };

  // Lọc chuyên gia theo từ khóa tìm kiếm và trạng thái
  const filteredSpecialists = specialists.filter(specialist => {
    const matchesSearch = searchTerm === "" || 
      (specialist.firstName + " " + specialist.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
      specialist.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      specialist.qualification?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === "" || specialist.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
      const response = await UserService.getStaff();
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Xử lý thay đổi user trong dropdown
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
        status: "ACTIVE"
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
      await SpecialistService.createSpecialist(formData);
      message.success("Tạo chuyên gia thành công");
      setIsOpen(false);
      fetchSpecialists();
    } catch (error) {
      console.error("Error creating specialist:", error);
      message.error(`Lỗi khi tạo chuyên gia: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Quản lý chuyên gia</h1>
        <span
          onClick={() => setIsOpen(true)}
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
          <div className="text-center py-8">
            <i className="fas fa-spinner fa-spin text-2xl text-pink-500"></i>
            <p className="mt-2">Đang tải danh sách chuyên gia...</p>
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
              {filteredSpecialists.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    Không tìm thấy chuyên gia nào
                  </td>
                </tr>
              ) : (
                filteredSpecialists.map((specialist) => (
                  <tr key={specialist.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                        {specialist.avatarUrl ? (
                          <img 
                            src={specialist.avatarUrl} 
                            alt={`${specialist.firstName} ${specialist.lastName}`}
                            className="h-full w-full object-cover"
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
                      <div className="text-sm text-gray-500">{specialist.email}</div>
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
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${specialist.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : ''}
                        ${specialist.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800' : ''}
                        ${specialist.status === 'ON_LEAVE' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${specialist.status === 'TERMINATED' ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {specialist.status === 'ACTIVE' && 'Đang hoạt động'}
                        {specialist.status === 'INACTIVE' && 'Tạm ngưng'}
                        {specialist.status === 'ON_LEAVE' && 'Đang nghỉ'}
                        {specialist.status === 'TERMINATED' && 'Đã chấm dứt'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        to={`/admin/specialists/view/${specialist.id}`}
                        className="text-cyan-500 hover:text-cyan-700 bg-cyan-100 hover:bg-cyan-200 p-1.5 rounded mr-1"
                      >
                        <i className="fas fa-eye"></i>
                      </Link>
                      <Link 
                        to={`/admin/specialists/edit/${specialist.id}`}
                        className="text-blue-500 hover:text-blue-700 bg-blue-100 hover:bg-blue-200 p-1.5 rounded mr-1"
                      >
                        <i className="fas fa-edit"></i>
                      </Link>
                      <button 
                        onClick={() => handleDeleteSpecialist(specialist.id)}
                        className="text-red-500 hover:text-red-700 bg-red-100 hover:bg-red-200 p-1.5 rounded"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={isOpen} onRequestClose={() => setIsOpen(false)} style={customStyles}>
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Thêm chuyên gia mới</h2>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Chọn nhân viên */}
            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1 required">
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

            {/* Display selected user info if any */}
            {selectedUser && (
              <div className="bg-gray-50 p-3 rounded-md">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Thông tin nhân viên đã chọn</h3>
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

            {/* Chuyên môn */}
            <div>
              <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-1">
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
              <label htmlFor="qualification" className="block text-sm font-medium text-gray-700 mb-1">
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
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
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
              <label htmlFor="workingHours" className="block text-sm font-medium text-gray-700 mb-1">
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

            {/* Trạng thái */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
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
              <label htmlFor="biography" className="block text-sm font-medium text-gray-700 mb-1">
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
              <button
                type="button"
                onClick={() => setIsOpen(false)}
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
                ) : "Tạo mới"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default SpecialistList; 