import React from "react";

const UserRoles = () => {
  const roles = [
    {
      id: 1,
      name: "Admin",
      description: "Quản trị hệ thống",
      permissionsCount: 10,
    },
    {
      id: 2,
      name: "Quản lý",
      description: "Quản lý hệ thống",
      permissionsCount: 8,
    },
    {
      id: 3,
      name: "Nhân viên",
      description: "Quản lý nhân viên",
      permissionsCount: 5,
    },
    {
      id: 4,
      name: "Khách hàng",
      description: "Quản lý khách hàng",
      permissionsCount: 3,
    },
    {
      id: 5,
      name: "Chuyên viên",
      description: "Quản lý chuyên viên",
      permissionsCount: 2,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Phân quyền người dùng</h1>
        < span className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md">
          <i className="fas fa-plus-circle"></i>
          <span>Thêm vai trò</span>
        </ span>
      </div>

      <div className="bg-white rounded-md shadow-sm p-6">
        <h2 className="text-lg font-medium mb-4">Danh sách vai trò</h2>

        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên vai trò
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mô tả
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Số quyền
              </th>

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {roles.map((role) => (
              <tr key={role.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {role.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {role.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {role.permissionsCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className="text-blue-500 hover:text-blue-700 bg-blue-100 hover:bg-blue-200 p-1 rounded mr-2 cursor-pointer">
                    <i className="fas fa-edit"></i>
                  </span>
                  <span className="text-red-500 hover:text-red-700 bg-red-100 hover:bg-red-200 p-1 rounded cursor-pointer ">
                    <i className="fas fa-trash-alt"></i>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserRoles;
