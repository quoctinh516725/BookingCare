import React, { useState } from "react";
import Modal from "react-modal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminService from "../../../../services/AdminService";
import { toast } from "sonner";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    width: "700px",
    maxWidth: "90%",
    borderRadius: "8px",
    padding: "20px",
    maxHeight: "90vh",
    overflow: "auto",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
};

const PermissionGroups = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissionIds: [],
  });

  // Fetch permission groups and permissions data
  const { data: permissionGroups = [], isLoading: isLoadingGroups, refetch: refetchGroups } = useQuery({
    queryKey: ["permissionGroups"],
    queryFn: AdminService.getAllPermissionGroups,
    onError: (error) => {
      console.error("Error fetching permission groups:", error);
      toast.error("Không thể tải danh sách nhóm quyền. Vui lòng thử lại sau.");
    }
  });

  const { data: permissions = [], isLoading: isLoadingPermissions, refetch: refetchPermissions } = useQuery({
    queryKey: ["permissions"],
    queryFn: AdminService.getAllPermissions,
    onError: (error) => {
      console.error("Error fetching permissions:", error);
      toast.error("Không thể tải danh sách quyền. Vui lòng thử lại sau.");
    }
  });

  // Create permission group mutation
  const createPermissionGroupMutation = useMutation({
    mutationFn: AdminService.createPermissionGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissionGroups"] });
      toast.success("Nhóm quyền đã được tạo thành công!");
      closeModal();
    },
    onError: (error) => {
      console.error("Error creating permission group:", error);
      toast.error(error.response?.data?.message || "Không thể tạo nhóm quyền. Vui lòng thử lại.");
    },
  });

  // Update permission group mutation
  const updatePermissionGroupMutation = useMutation({
    mutationFn: ({ id, data }) => AdminService.updatePermissionGroup(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissionGroups"] });
      toast.success("Nhóm quyền đã được cập nhật thành công!");
      closeModal();
    },
    onError: (error) => {
      console.error("Error updating permission group:", error);
      toast.error(error.response?.data?.message || "Không thể cập nhật nhóm quyền. Vui lòng thử lại.");
    },
  });

  // Delete permission group mutation
  const deletePermissionGroupMutation = useMutation({
    mutationFn: AdminService.deletePermissionGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissionGroups"] });
      toast.success("Nhóm quyền đã được xóa thành công!");
    },
    onError: (error) => {
      console.error("Error deleting permission group:", error);
      toast.error(error.response?.data?.message || "Không thể xóa nhóm quyền. Vui lòng thử lại.");
    },
  });

  // Refresh data
  const refreshData = () => {
    refetchGroups();
    refetchPermissions();
    toast.info("Đang làm mới dữ liệu...");
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === "checkbox") {
      const permissionId = value;
      let updatedPermissionIds = [...formData.permissionIds];
      
      if (checked) {
        // Add permission if not already included
        if (!updatedPermissionIds.includes(permissionId)) {
          updatedPermissionIds.push(permissionId);
        }
      } else {
        // Remove permission
        updatedPermissionIds = updatedPermissionIds.filter(id => id !== permissionId);
      }
      
      setFormData({
        ...formData,
        permissionIds: updatedPermissionIds,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    if (isEditMode && selectedGroup) {
      updatePermissionGroupMutation.mutate({ 
        id: selectedGroup.id, 
        data: formData 
      });
    } else {
      createPermissionGroupMutation.mutate(formData);
    }
  };

  const handleEditGroup = (group) => {
    setSelectedGroup(group);
    
    // Extract permission IDs from group
    const permissionIds = group.permissions.map(p => p.id);
    
    setFormData({
      name: group.name || "",
      description: group.description || "",
      permissionIds: permissionIds,
    });
    
    setIsEditMode(true);
    setIsOpen(true);
  };

  const handleDeleteGroup = (groupId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa nhóm quyền này không? Điều này có thể ảnh hưởng đến quyền của người dùng.")) {
      deletePermissionGroupMutation.mutate(groupId);
    }
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setSelectedGroup(null);
    setFormData({
      name: "",
      description: "",
      permissionIds: [],
    });
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setIsEditMode(false);
    setSelectedGroup(null);
  };

  // Group permissions by category for better organization
  const groupPermissionsByCategory = () => {
    const groupedPermissions = {};
    
    permissions.forEach(permission => {
      // Extract category from permission code (e.g., "user:view" => "user")
      const category = permission.code.split(':')[0];
      
      if (!groupedPermissions[category]) {
        groupedPermissions[category] = [];
      }
      
      groupedPermissions[category].push(permission);
    });
    
    return groupedPermissions;
  };

  // Hàm hiển thị tên nhóm quyền dễ đọc hơn
  const getReadableCategoryName = (category) => {
    const categoryMap = {
      'user': 'Người dùng',
      'service': 'Dịch vụ',
      'booking': 'Đặt lịch',
      'feedback': 'Đánh giá',
      'payment': 'Thanh toán',
      'report': 'Báo cáo',
      'data': 'Dữ liệu',
      'stats': 'Thống kê',
      'staff': 'Nhân viên',
      'permission': 'Quyền hạn',
      'settings': 'Cài đặt',
      'logs': 'Nhật ký',
      'system': 'Hệ thống',
      'dashboard': 'Bảng điều khiển'
    };
    return categoryMap[category] || category.charAt(0).toUpperCase() + category.slice(1);
  };

  // Filter groups based on search term
  const filteredGroups = permissionGroups.filter(group => 
    (group.name && group.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (group.description && group.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Quản lý nhóm quyền</h1>
        <div className="flex gap-2">
          <button
            onClick={refreshData}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md cursor-pointer"
          >
            <i className="fas fa-sync-alt"></i>
            <span>Làm mới</span>
          </button>
          <span
            onClick={openAddModal}
            className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md cursor-pointer"
          >
            <i className="fas fa-plus-circle"></i>
            <span>Thêm nhóm quyền</span>
          </span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-grow">
          <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          <input
            type="text"
            placeholder="Tìm kiếm nhóm quyền..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>
      </div>

      {isLoadingGroups ? (
        <div className="flex justify-center items-center py-10">
          <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white rounded-md shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên nhóm quyền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mô tả
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số quyền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số người dùng
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGroups.length > 0 ? (
                filteredGroups.map((group) => (
                  <tr key={group.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {group.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {group.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {group.permissions.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {group.userCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                      <span 
                        className="text-blue-500 hover:text-blue-700 bg-blue-100 hover:bg-blue-200 p-1 rounded mr-2 cursor-pointer"
                        onClick={() => handleEditGroup(group)}
                      >
                        <i className="fas fa-edit"></i>
                      </span>
                      <span 
                        className="text-red-500 hover:text-red-700 bg-red-100 hover:bg-red-200 p-1 rounded cursor-pointer"
                        onClick={() => handleDeleteGroup(group.id)}
                      >
                        <i className="fas fa-trash-alt"></i>
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    {searchTerm ? "Không tìm thấy nhóm quyền phù hợp" : "Không có nhóm quyền nào"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for adding/editing permission groups */}
      <Modal
        isOpen={isOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel={isEditMode ? "Cập nhật nhóm quyền" : "Thêm nhóm quyền mới"}
        ariaHideApp={false}
      >
        <div className="relative">
          <button
            onClick={closeModal}
            className="absolute top-0 right-0 text-gray-400 hover:text-gray-600"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
          
          <h2 className="text-xl font-bold mb-4">{isEditMode ? "Cập nhật nhóm quyền" : "Thêm nhóm quyền mới"}</h2>
          
          <form onSubmit={handleFormSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên nhóm quyền <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                required
                value={formData.description}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                rows="3"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quyền hạn
              </label>
              
              {isLoadingPermissions ? (
                <div className="flex justify-center items-center py-4">
                  <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="border border-gray-300 rounded-md p-4 max-h-60 overflow-y-auto">
                  {Object.entries(groupPermissionsByCategory()).map(([category, categoryPermissions]) => (
                    <div key={category} className="mb-4">
                      <h3 className="text-md font-medium text-gray-800 capitalize mb-2">{getReadableCategoryName(category)}</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {categoryPermissions.map((permission) => (
                          <div key={permission.id} className="flex items-start">
                            <input
                              type="checkbox"
                              id={`permission-${permission.id}`}
                              name="permissionIds"
                              value={permission.id}
                              checked={formData.permissionIds.includes(permission.id)}
                              onChange={handleInputChange}
                              className="mt-1 mr-2"
                            />
                            <label htmlFor={`permission-${permission.id}`} className="text-sm text-gray-700">
                              <div>{permission.name}</div>
                              <div className="text-xs text-gray-500">{permission.description}</div>
                              <div className="text-xs text-gray-400">{permission.code}</div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <span
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Hủy
              </span>
              <button
                type="submit"
                disabled={createPermissionGroupMutation.isPending || updatePermissionGroupMutation.isPending}
                className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createPermissionGroupMutation.isPending || updatePermissionGroupMutation.isPending ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xử lý...
                  </span>
                ) : isEditMode ? "Cập nhật" : "Tạo mới"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default PermissionGroups; 