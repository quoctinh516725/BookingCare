import React, { useState, useEffect, useCallback } from "react";
import AdminService from "../../../../services/AdminService";
import { toast } from "sonner";
import Pagination from "../../../components/Pagination";
const UserPermissions = () => {
  const [users, setUsers] = useState([]);
  const [permissionGroups, setPermissionGroups] = useState([]);
  const [userPermissions, setUserPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Hàm lấy tên hiển thị của người dùng
  const getUserDisplayName = (user) => {
    if (user.fullName) return user.fullName;
    if (user.firstName && user.lastName)
      return `${user.firstName} ${user.lastName}`;
    if (user.firstName) return user.firstName;
    if (user.lastName) return user.lastName;
    if (user.username) return user.username;
    if (user.email) return user.email;
    return "Người dùng";
  };

  // Hàm hiển thị tên quyền người dùng thân thiện hơn
  const getReadableRoleName = (roleName) => {
    const roleMap = {
      ADMIN: "Quản trị viên",
      STAFF: "Nhân viên",
      CUSTOMER: "Khách hàng",
    };
    return roleMap[roleName] || roleName;
  };

  // Tạo hàm fetchData bên ngoài useEffect để có thể gọi lại khi cần làm mới dữ liệu
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Lấy danh sách người dùng, nhóm quyền và quyền của tất cả người dùng (song song)
      const [usersData, groupsData, allPermissionsData] = await Promise.all([
        AdminService.getAllUsers(),
        AdminService.getAllPermissionGroups(),
        AdminService.getAllUserPermissionGroups(),
      ]);

      if (!usersData || !Array.isArray(usersData)) {
        console.error("Invalid users data:", usersData);
        toast.error("Dữ liệu người dùng không hợp lệ");
        setLoading(false);
        return;
      }

      if (!groupsData || !Array.isArray(groupsData)) {
        console.error("Invalid permission groups data:", groupsData);
        toast.error("Dữ liệu nhóm quyền không hợp lệ");
        setLoading(false);
        return;
      }

      if (!allPermissionsData || typeof allPermissionsData !== "object") {
        console.error("Invalid all permissions data:", allPermissionsData);
        toast.error("Dữ liệu quyền không hợp lệ");
        setLoading(false);
        return;
      }

      setUsers(usersData);
      setPermissionGroups(groupsData);
      setUserPermissions(allPermissionsData);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      setLoading(false);
    }
  }, []);

  // Lấy danh sách người dùng và nhóm quyền khi component được tải
  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);

  // Lọc người dùng dựa trên từ khóa tìm kiếm và vai trò
  const filteredUsers = users.filter((user) => {
    const fullName = getUserDisplayName(user).toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      (user.firstName &&
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.lastName &&
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email &&
        user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.username &&
        user.username.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Reset trang khi filter/search thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter]);

  // Tính toán items hiển thị trên trang hiện tại
  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Kiểm tra xem người dùng có nhóm quyền cụ thể không
  const hasPermissionGroup = (userId, groupId) => {
    return userPermissions[userId]?.includes(groupId);
  };

  // Xử lý thay đổi nhóm quyền cho người dùng
  const togglePermissionGroup = async (userId, groupId, hasGroup) => {
    try {
      setLoading(true);

      if (hasGroup) {
        // Gỡ bỏ nhóm quyền
        await AdminService.removePermissionGroupFromUser(userId, groupId);
        toast.success("Đã gỡ bỏ nhóm quyền thành công");

        // Cập nhật state
        setUserPermissions((prev) => ({
          ...prev,
          [userId]: prev[userId]?.filter((id) => id !== groupId) || [],
        }));
      } else {
        // Gán nhóm quyền
        await AdminService.assignPermissionGroupToUser(userId, groupId);
        toast.success("Đã gán nhóm quyền thành công");

        // Cập nhật state
        setUserPermissions((prev) => ({
          ...prev,
          [userId]: [...(prev[userId] || []), groupId],
        }));
      }

      setLoading(false);
    } catch (error) {
      console.error("Error toggling permission group:", error);
      toast.error("Không thể thay đổi quyền. Vui lòng thử lại sau.");
      setLoading(false);
      // Tải lại dữ liệu để đảm bảo đồng bộ
      fetchData();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold mb-6">Quản lý quyền người dùng</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="relative w-full">
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Tìm kiếm người dùng..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="w-full md:w-auto">
            <select
              className="w-full ml-5 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">Tất cả vai trò</option>
              <option value="ADMIN">Admin</option>
              <option value="STAFF">Nhân viên</option>
              <option value="CUSTOMER">Khách hàng</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary-color)]"></div>
            <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Không tìm thấy người dùng nào. Vui lòng thêm người dùng trước.
          </div>
        ) : permissionGroups.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Không tìm thấy nhóm quyền nào. Vui lòng tạo nhóm quyền trước.
          </div>
        ) : (
          <div className="">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người dùng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vai trò
                  </th>
                  {permissionGroups.map((group) => (
                    <th
                      key={group.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      title={group.description}
                    >
                      {group.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentUsers.length > 0 ? (
                  currentUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {getUserDisplayName(user)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === "ADMIN"
                              ? "bg-red-100 text-red-800"
                              : user.role === "STAFF"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {getReadableRoleName(user.role)}
                        </span>
                      </td>
                      {permissionGroups.map((group) => {
                        // Kiểm tra xem người dùng có nhóm quyền này không
                        const hasGroup = hasPermissionGroup(user.id, group.id);
                        const isAdmin = user.role === "ADMIN";

                        return (
                          <td
                            key={`${user.id}-${group.id}`}
                            className="px-6 py-4 whitespace-nowrap text-center"
                          >
                            <div className="flex justify-center items-center">
                              <input
                                type="checkbox"
                                className="h-4 w-4 text-[var(--primary-color)] focus:ring-[var(--primary-color)] border-gray-300 rounded"
                                checked={isAdmin || hasGroup}
                                disabled={isAdmin} // Admin luôn có tất cả quyền
                                onChange={() => {
                                  if (!isAdmin) {
                                    togglePermissionGroup(
                                      user.id,
                                      group.id,
                                      hasGroup
                                    );
                                  }
                                }}
                              />
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={2 + permissionGroups.length}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      Không tìm thấy người dùng phù hợp với bộ lọc
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {filteredUsers.length > 0 && (
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalItems={filteredUsers.length}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Lưu ý:</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>
            <strong>Admin</strong> mặc định có tất cả các quyền trong hệ thống
            và không thể chỉnh sửa.
          </li>
          <li>
            <strong>Nhân viên (Staff)</strong> có thể được gán thêm quyền tùy
            theo vai trò công việc.
          </li>
          <li>
            <strong>Khách hàng (Customer)</strong> chỉ có các quyền cơ bản và có
            thể được gán thêm quyền đặc biệt nếu cần.
          </li>
          <li>
            Các nhóm quyền đại diện cho một tập hợp các quyền liên quan đến một
            chức năng cụ thể trong hệ thống.
          </li>
          <li>Điều chỉnh quyền của người dùng sẽ có hiệu lực ngay lập tức.</li>
        </ul>
      </div>
    </div>
  );
};

export default UserPermissions;
