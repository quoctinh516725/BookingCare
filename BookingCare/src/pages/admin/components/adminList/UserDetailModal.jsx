import React from "react";
import Modal from "react-modal";
import UserAvatar from "./UserAvatar";
import UserStatusBadge from "./UserStatusBadge";
import UserRoleBadge from "./UserRoleBadge";

Modal.setAppElement("#root");

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    maxWidth: "600px",
    width: "95%",
    maxHeight: "90vh",
    overflow: "auto",
    borderRadius: "8px",
    padding: "24px",
    boxShadow:
      "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    zIndex: 1000,
  },
};

const UserDetailModal = ({ isOpen, onClose, user, onEdit }) => {
  if (!user) return null;

  const createdDate = user.createdAt ? new Date(user.createdAt).toLocaleString('vi-VN') : 'N/A';
  const lastUpdatedDate = user.updatedAt ? new Date(user.updatedAt).toLocaleString('vi-VN') : 'N/A';
  const lastLoginDate = user.lastLogin ? new Date(user.lastLogin).toLocaleString('vi-VN') : 'Chưa đăng nhập';

  const handleEdit = () => {
    onClose();
    if (onEdit) onEdit(user);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStyles}
      contentLabel="Chi tiết quản trị viên"
    >
      <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800">Chi tiết quản trị viên</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="mb-6 flex items-center">
        <div className="mr-4">
          <UserAvatar src={user.avatarUrl} alt={user.fullName} size="xl" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">{user.fullName}</h3>
          <p className="text-sm text-gray-500">{user.email}</p>
          <div className="mt-2 flex space-x-2">
            <UserRoleBadge role={user.role} />
            <UserStatusBadge isActive={user.isActive} />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Thông tin tài khoản</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Ngày tạo</p>
            <p className="text-sm">{createdDate}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Cập nhật gần đây</p>
            <p className="text-sm">{lastUpdatedDate}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Đăng nhập gần đây</p>
            <p className="text-sm">{lastLoginDate}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">ID</p>
            <p className="text-sm font-mono">{user.id}</p>
          </div>
        </div>
      </div>

      {user.permissions && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Quyền hạn</h4>
          <div className="flex flex-wrap gap-2">
            {user.permissions.map((permission, index) => (
              <span
                key={index}
                className="inline-flex bg-white px-2 py-1 text-xs rounded border border-gray-200"
              >
                {permission}
              </span>
            ))}
            {user.permissions.length === 0 && (
              <span className="text-sm text-gray-500">Không có quyền hạn cụ thể</span>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 mr-3"
        >
          Đóng
        </button>
        <button
          onClick={handleEdit}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
        >
          Chỉnh sửa
        </button>
      </div>
    </Modal>
  );
};

export default UserDetailModal; 