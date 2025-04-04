import React from "react";
import { Link } from "react-router-dom";

const UserRoles = () => {
  const roles = [
    {
      id: 1,
      name: "ADMIN",
      description: "Quản trị viên hệ thống với toàn quyền truy cập",
      permissionsCount: "Tất cả",
    },
    {
      id: 2,
      name: "STAFF",
      description: "Nhân viên có thể quản lý dịch vụ và lịch hẹn",
      permissionsCount: "Theo nhóm",
    },
    {
      id: 3,
      name: "CUSTOMER",
      description: "Khách hàng có quyền đặt lịch và quản lý tài khoản cá nhân",
      permissionsCount: "Giới hạn",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Vai trò người dùng</h1>
      </div>

      <div className="bg-white rounded-md shadow-sm p-6 mb-6">
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <i className="fas fa-info-circle text-blue-500"></i>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Hệ thống phân quyền mới
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Hệ thống đã được nâng cấp lên phân quyền động với tính năng quản lý nhóm quyền.
                  Thay vì phân quyền cứng theo vai trò, bạn có thể:
                </p>
                <ul className="list-disc pl-5 mt-2">
                  <li>
                    <Link to="/admin/permissions/groups" className="text-blue-600 underline">
                      Quản lý nhóm quyền
                    </Link> - Tạo và chỉnh sửa các nhóm quyền với các quyền cụ thể
                  </li>
                  <li>
                    <Link to="/admin/permissions/users" className="text-blue-600 underline">
                      Phân quyền người dùng
                    </Link> - Gán nhóm quyền cho người dùng cụ thể
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-lg font-medium mb-4">Vai trò mặc định của hệ thống</h2>

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
                Quyền
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {roles.map((role) => (
              <tr key={role.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    role.name === 'ADMIN' ? 'bg-red-100 text-red-800' :
                    role.name === 'STAFF' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {role.name}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {role.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {role.permissionsCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <h3 className="text-md font-medium text-yellow-800 mb-2">Lưu ý về vai trò hệ thống:</h3>
        <ul className="list-disc pl-5 text-sm text-yellow-700 space-y-1">
          <li>Vai trò <strong>ADMIN</strong> luôn có tất cả các quyền trong hệ thống.</li>
          <li>Vai trò <strong>STAFF</strong> và <strong>CUSTOMER</strong> có thể được cấp các nhóm quyền tùy chỉnh.</li>
          <li>Vai trò là cố định, nhưng quyền trong vai trò có thể được tùy chỉnh thông qua hệ thống nhóm quyền mới.</li>
          <li>Để thêm nhóm quyền mới hoặc gán quyền cho người dùng, vui lòng sử dụng các trang liên kết ở trên.</li>
        </ul>
      </div>
    </div>
  );
};

export default UserRoles;
