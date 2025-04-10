import React from "react";

const SpecialistList = () => {
  // Mock specialists data
  const specialists = [
    {
      id: 1,
      name: "Nguyễn Thị A",
      specialty: "Chăm sóc da",
      email: "nguyenthia@example.com",
      phone: "0901234567",
      experience: "5 năm",
      rating: 4.8,
      status: "Đang làm việc",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      id: 2,
      name: "Trần Văn B",
      specialty: "Trị mụn",
      email: "tranvanb@example.com",
      phone: "0912345678",
      experience: "3 năm",
      rating: 4.5,
      status: "Đang làm việc",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      id: 3,
      name: "Lê Thị C",
      specialty: "Massage mặt",
      email: "lethic@example.com",
      phone: "0923456789",
      experience: "7 năm",
      rating: 4.9,
      status: "Đang làm việc",
      avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    },
    {
      id: 4,
      name: "Phạm Văn D",
      specialty: "Trẻ hóa da",
      email: "phamvand@example.com",
      phone: "0934567890",
      experience: "4 năm",
      rating: 4.6,
      status: "Nghỉ việc",
      avatar: "https://randomuser.me/api/portraits/men/75.jpg",
    },
  ];

  // Function to render stars based on rating
  const renderStars = (rating) => {
    return (
      <div className="flex items-center">
        <span className="text-yellow-400 mr-1">★</span>
        <span>{rating}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className=" mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Quản lý chuyên viên
          </h1>
          <span className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors">
            <i className="fas fa-plus w-5 h-5 mr-2"></i>
            Thêm chuyên viên
          </span>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-5">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <i className="fas fa-search w-5 h-5 text-gray-400"></i>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                placeholder="Tìm kiếm theo tên, chuyên môn, email hoặc số điện thoại..."
              />
            </div>
          </div>

          <div className="p-5">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Danh sách chuyên viên
            </h2>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Tên
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Chuyên môn
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Số điện thoại
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Kinh nghiệm
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Đánh giá
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
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {specialists.map((specialist) => (
                    <tr key={specialist.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full"
                              src={specialist.avatar}
                              alt=""
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {specialist.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {specialist.specialty}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {specialist.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {specialist.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {specialist.experience}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStars(specialist.rating)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            specialist.status === "Đang làm việc"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {specialist.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span
                          className="text-blue-500 hover:text-blue-700 bg-blue-100 hover:bg-blue-200 p-1 rounded mr-2 cursor-pointer"
                          onClick={() => handleEditUser(user)}
                        >
                          <i className="fas fa-edit"></i>
                        </span>
                        <span
                          className="text-red-500 hover:text-red-700 bg-red-100 hover:bg-red-200 p-1 rounded cursor-pointer"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <i className="fas fa-trash-alt"></i>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialistList;
