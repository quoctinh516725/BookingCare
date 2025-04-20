import React from "react";
import UserAvatar from "./UserAvatar";
import UserStatusBadge from "./UserStatusBadge";
import UserRoleBadge from "./UserRoleBadge";
import { useAdminList } from "../../contexts/AdminListContext";

const UserRow = ({ user, onEdit, onView }) => {
  const { deleteUser, changeUserStatus } = useAdminList();

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này không?")) {
      try {
        await deleteUser(user.id);
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
    }
  };

  const handleStatusChange = async (e) => {
    e.stopPropagation();
    try {
      await changeUserStatus(user.id, !user.isActive);
    } catch (error) {
      console.error("Failed to change user status:", error);
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit) onEdit(user);
  };

  const handleView = () => {
    if (onView) onView(user);
  };

  return (
    <tr 
      className="hover:bg-gray-50 cursor-pointer"
      onClick={handleView}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <UserAvatar
              src={user.avatarUrl}
              alt={user.fullName}
            />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <UserRoleBadge role={user.role} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <UserStatusBadge isActive={user.isActive} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {user.formattedCreatedAt || new Date(user.createdAt).toLocaleString('vi-VN')}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {user.lastLogin ? new Date(user.lastLogin).toLocaleString('vi-VN') : 'Chưa đăng nhập'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex space-x-2 justify-end">
          <button
            onClick={handleEdit}
            className="text-blue-500 hover:text-blue-700 bg-blue-100 hover:bg-blue-200 p-1 rounded"
          >
            <i className="fas fa-edit"></i>
          </button>
          <button
            onClick={handleStatusChange}
            className={`${
              user.isActive
                ? "text-yellow-500 hover:text-yellow-700 bg-yellow-100 hover:bg-yellow-200"
                : "text-green-500 hover:text-green-700 bg-green-100 hover:bg-green-200"
            } p-1 rounded`}
            title={user.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
          >
            <i className={`fas ${user.isActive ? "fa-user-slash" : "fa-user-check"}`}></i>
          </button>
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 bg-red-100 hover:bg-red-200 p-1 rounded"
            title="Xóa"
          >
            <i className="fas fa-trash-alt"></i>
          </button>
        </div>
      </td>
    </tr>
  );
};

export default React.memo(UserRow); 