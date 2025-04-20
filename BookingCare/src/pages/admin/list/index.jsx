import React, { useState } from "react";
import { AdminListProvider } from "../contexts/AdminListContext";
import UserTable from "../components/adminList/UserTable";
import UserFormModal from "../components/adminList/UserFormModal";
import UserDetailModal from "../components/adminList/UserDetailModal";

const AdminListPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsCreating(false);
    setIsFormModalOpen(true);
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsCreating(true);
    setIsFormModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsDetailModalOpen(false);
    setIsFormModalOpen(false);
  };

  return (
    <AdminListProvider>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Quản lý tài khoản Admin</h1>
          <button
            onClick={handleCreateUser}
            className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
          >
            Thêm quản trị viên
          </button>
        </div>

        <UserTable onView={handleViewUser} onEdit={handleEditUser} />

        <UserDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseModals}
          user={selectedUser}
          onEdit={handleEditUser}
        />

        <UserFormModal
          isOpen={isFormModalOpen}
          onClose={handleCloseModals}
          user={selectedUser}
          isCreating={isCreating}
        />
      </div>
    </AdminListProvider>
  );
};

export default AdminListPage; 