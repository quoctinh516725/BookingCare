import React from "react";

const UserFilters = ({ 
  searchTerm, 
  roleFilter, 
  statusFilter, 
  onSearchChange, 
  onRoleFilterChange, 
  onStatusFilterChange, 
  onResetFilters 
}) => {
  return (
    <div className="p-4 bg-white rounded-t-lg border-b border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <i className="fas fa-search w-5 h-5 text-gray-400"></i>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={onSearchChange}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
            placeholder="Tìm kiếm quản trị viên..."
          />
        </div>
        
        <div className="flex flex-wrap sm:flex-nowrap gap-2">
          <select
            value={roleFilter}
            onChange={onRoleFilterChange}
            className="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
          >
            <option value="">Tất cả vai trò</option>
            <option value="ADMIN">Quản trị viên</option>
            <option value="MANAGER">Quản lý</option>
            <option value="STAFF">Nhân viên</option>
            <option value="EDITOR">Biên tập viên</option>
          </select>
          
          <select
            value={statusFilter}
            onChange={onStatusFilterChange}
            className="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Đã vô hiệu</option>
          </select>
          
          <button
            onClick={onResetFilters}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
          >
            <i className="fas fa-redo mr-1"></i> Đặt lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(UserFilters); 