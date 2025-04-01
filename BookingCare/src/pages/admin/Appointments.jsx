import React, { useState } from "react";
import { Link } from "react-router-dom";
const Appointments = () => {
  const [showCancelled, setShowCancelled] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  // Mock appointment data
  const appointments = [
    {
      id: 1,
      customer: "Nguyễn Văn A",
      contact: { email: "nguyenvana@example.com", phone: "0901234567" },
      service: "Chăm sóc da cơ bản",
      specialist: "Lê Thị B",
      date: "15/09/2023 09:00",
      status: "Hoàn thành",
    },
    {
      id: 2,
      customer: "Lê Văn E",
      contact: { email: "levane@example.com", phone: "0987654321" },
      service: "Massage mặt",
      specialist: "Nguyễn Thị F",
      date: "17/09/2023 11:00",
      status: "Chờ xác nhận",
    },
    {
      id: 3,
      customer: "Hoàng Thị G",
      contact: { email: "hoangthig@example.com", phone: "0932345678" },
      service: "Trẻ hóa da",
      specialist: "Vũ Văn H",
      date: "20/09/2023 14:00",
      status: "Đã xác nhận",
    },
    {
      id: 4,
      customer: "Ngô Văn I",
      contact: { email: "ngovani@example.com", phone: "0945678912" },
      service: "Tẩy trang chuyên sâu",
      specialist: "Lý Thị K",
      date: "22/09/2023 10:30",
      status: "Chờ xác nhận",
    },
  ];

  // Get status color and text
  const getStatusClasses = (status) => {
    switch (status) {
      case "Hoàn thành":
        return "bg-blue-100 text-blue-800";
      case "Chờ xác nhận":
        return "bg-yellow-100 text-yellow-800";
      case "Đã xác nhận":
        return "bg-green-100 text-green-800";
      case "Hủy":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className=" mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Quản lý lịch đặt</h1>
          <span className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors">
            <i className="fas fa-plus w-5 h-5 mr-2"></i>
            Đặt lịch mới
          </span>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="mb-4 md:mb-0 w-full md:w-64">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <i className="fas fa-search w-5 h-5 text-gray-400"></i>
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="Tìm kiếm lịch đặt..."
                />
              </div>
            </div>
            <div className="flex items-center">
              <input
                id="show-cancelled"
                type="checkbox"
                className="h-4 w-4 text-pink-500 focus:ring-pink-400 border-gray-300 rounded"
                checked={showCancelled}
                onChange={(e) => setShowCancelled(e.target.checked)}
              />
              <label
                htmlFor="show-cancelled"
                className="ml-2 text-sm text-gray-700"
              >
                Hiển thị đã hủy
              </label>
            </div>
          </div>

          <div className="p-4 ">
            <div className="flex space-x-2 overflow-x-auto">
              <span
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  activeFilter === "all"
                    ? "bg-gray-100 text-gray-800"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
                onClick={() => setActiveFilter("all")}
              >
                Tất cả
              </span>
              <span
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  activeFilter === "pending"
                    ? "bg-gray-100 text-gray-800"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
                onClick={() => setActiveFilter("pending")}
              >
                Chờ xác nhận
              </span>
              <span
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  activeFilter === "confirmed"
                    ? "bg-gray-100 text-gray-800"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
                onClick={() => setActiveFilter("confirmed")}
              >
                Đã xác nhận
              </span>
              <span
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  activeFilter === "completed"
                    ? "bg-gray-100 text-gray-800"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
                onClick={() => setActiveFilter("completed")}
              >
                Hoàn thành
              </span>
              <span
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  activeFilter === "cancelled"
                    ? "bg-gray-100 text-gray-800"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
                onClick={() => setActiveFilter("cancelled")}
              >
                Đã hủy
              </span>
            </div>
          </div>

          <div className="p-4">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Danh sách lịch đặt
            </h2>

            <div className="overflow-x-hidden">
              <table className="min-w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th scope="col" className="px-6 py-3 border-b">
                      Khách hàng
                    </th>
                    <th scope="col" className="px-6 py-3 border-b">
                      Liên hệ
                    </th>
                    <th scope="col" className="px-6 py-3 border-b">
                      Dịch vụ
                    </th>
                    <th scope="col" className="px-6 py-3 border-b">
                      Chuyên viên
                    </th>
                    <th scope="col" className="px-6 py-3 border-b">
                      Ngày giờ
                    </th>
                    <th scope="col" className="px-6 py-3 border-b">
                      Trạng thái
                    </th>
                    <th scope="col" className="px-6 py-3 border-b">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {appointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {appointment.customer}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {appointment.contact.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.contact.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {appointment.service}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {appointment.specialist}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {appointment.date}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(
                            appointment.status
                          )}`}
                        >
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {appointment.status === "Chờ xác nhận" ? (
                          <div className="flex space-x-2 items-center">
                            <div className="flex space-x-2 items-center min-w-[14 0px]">
                              {" "}
                              <span className="text-blue-500 hover:text-blue-700 bg-blue-100 hover:bg-blue-200 p-1 rounded mr-2 cursor-pointer">
                                <i className="fas fa-check"></i> Xác nhận
                              </span>
                              <span className="text-red-500 hover:text-red-700 bg-red-100 hover:bg-red-200 p-1 rounded cursor-pointer ">
                                <i className="fas fa-times"></i> Hủy
                              </span>
                            </div>
                            <Link
                              to="#"
                              className="text-black hover:opacity-80  p-1 rounded cursor-pointer "
                            >
                              <i className="fas fa-info-circle"></i> Chi tiết
                            </Link>
                          </div>
                        ) : (
                          <div className="flex space-x-2 items-center">
                            <div className="flex space-x-2 items-center min-w-[140px]">
                              <span className="text-green-500 hover:text-green-700 bg-green-100 hover:bg-green-200 p-1 rounded font-medium">
                                <i className="fas fa-check"></i> Hoàn thành
                              </span>
                            </div>
                            <Link
                              to="#"
                              className="text-black hover:opacity-80  p-1 rounded cursor-pointer "
                            >
                              <i className="fas fa-info-circle"></i> Chi tiết
                            </Link>
                          </div>
                        )}
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

export default Appointments;
