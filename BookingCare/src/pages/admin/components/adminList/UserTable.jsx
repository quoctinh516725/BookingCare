import React, { useState, useMemo } from "react";
import { useAdminList } from "../../contexts/AdminListContext";
import UserRow from "./UserRow";
import Pagination from "../../../../components/Pagination";

const UserTable = ({ onEdit, onView }) => {
  const { users, loading, error } = useAdminList();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Filter users based on search, role, and status
  const filteredUsers = useMemo(() => {
    let filtered = [...users];

    // Apply search filter
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((user) => {
        return (
          user.fullName?.toLowerCase().includes(term) ||
          user.email?.toLowerCase().includes(term) ||
          user.phone?.toLowerCase().includes(term) ||
          user.role?.toLowerCase().includes(term)
        );
      });
    }

    // Apply role filter
    if (roleFilter) {
      filtered = filtered.filter(user => 
        user.role?.toUpperCase() === roleFilter.toUpperCase()
      );
    }

    // Apply status filter
    if (statusFilter !== "") {
      const isActive = statusFilter === "active";
      filtered = filtered.filter(user => user.isActive === isActive);
    }

    return filtered;
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Get paginated data
  const getPaginatedData = useMemo(() => {
    const totalItems = filteredUsers.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    
    // Ensure current page is valid
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }

    const indexOfLastItem = currentPage * pageSize;
    const indexOfFirstItem = indexOfLastItem - pageSize;
    
    return {
      data: filteredUsers.slice(indexOfFirstItem, indexOfLastItem),
      totalItems,
    };
  }, [filteredUsers, currentPage, pageSize]);

  // Handle page change
  const handlePageChange = (page, newPageSize) => {
    setCurrentPage(page);
    if (newPageSize) {
      setPageSize(newPageSize);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Handle role filter change
  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
    setCurrentPage(1);
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setRoleFilter("");
    setStatusFilter("");
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col">
      <div className="p-4 bg-white rounded-t-lg border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <i className="fas fa-search w-5 h-5 text-gray-400"></i>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
              placeholder="Tìm kiếm quản trị viên..."
            />
          </div>
          
          <div className="flex flex-wrap sm:flex-nowrap gap-2">
            <select
              value={roleFilter}
              onChange={handleRoleFilterChange}
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
              onChange={handleStatusFilterChange}
              className="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Đã vô hiệu</option>
            </select>
            
            <button
              onClick={resetFilters}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
            >
              <i className="fas fa-redo mr-1"></i> Đặt lại
            </button>
          </div>
        </div>
      </div>

      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            {loading ? (
              <div className="text-center py-8 bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 bg-white text-red-500">
                <p>{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 text-pink-500 hover:text-pink-600"
                >
                  Thử lại
                </button>
              </div>
            ) : getPaginatedData.data.length === 0 ? (
              <div className="text-center py-8 bg-white">
                <p className="text-gray-500">Không tìm thấy quản trị viên nào</p>
                <button
                  onClick={resetFilters}
                  className="mt-2 text-pink-500 hover:text-pink-600"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Người dùng
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Vai trò
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Trạng thái
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Ngày tạo
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Đăng nhập gần đây
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getPaginatedData.data.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      onEdit={onEdit}
                      onView={onView}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalItems={getPaginatedData.totalItems}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onShowSizeChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default UserTable; 