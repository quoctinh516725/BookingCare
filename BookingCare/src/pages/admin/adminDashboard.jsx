import React from "react";

const AdminDashboard = () => {
  // Mock data for statistics cards
  const statistics = [
    {
      title: "Người dùng",
      value: "195",
      change: "+15% so với tháng trước",
      icon: <i className="fas fa-users h-5 w-5 text-blue-500"></i>,
    },
    {
      title: "Dịch vụ",
      value: "25",
      change: "+5% so với tháng trước",
      icon: <i className="fas fa-concierge-bell h-5 w-5 text-purple-500"></i>,
    },
    {
      title: "Chuyên viên",
      value: "12",
      change: "+2 người mới",
      icon: <i className="fas fa-user-check h-5 w-5 text-blue-500"></i>,
    },
    {
      title: "Lịch đặt",
      value: "237",
      change: "+12% so với tháng trước",
      icon: <i className="fas fa-calendar-alt h-5 w-5 text-blue-500"></i>,
    },
    {
      title: "Doanh thu",
      value: "15.780.000 đ",
      change: "+8% so với tháng trước",
      icon: <i className="fas fa-dollar-sign h-5 w-5 text-green-500"></i>,
    },
  ];

  // Mock data for appointments
  const appointments = [
    {
      customer: "Nguyễn Văn A",
      service: "Chăm sóc da cơ bản",
      time: "15/6/2023 09:00",
      status: "Đã hoàn thành",
    },
    {
      customer: "Trần Thị B",
      service: "Trị mụn chuyên sâu",
      time: "15/6/2023 11:00",
      status: "Đang chờ",
    },
    {
      customer: "Lê Văn C",
      service: "Trẻ hóa da",
      time: "16/6/2023 10:00",
      status: "Đã hoàn thành",
    },
    {
      customer: "Phạm Thị D",
      service: "Massage mặt",
      time: "16/6/2023 14:00",
      status: "Đã hủy",
    },
    {
      customer: "Hoàng Văn E",
      service: "Tẩy trang chuyên sâu",
      time: "17/6/2023 09:30",
      status: "Đang chờ",
    },
  ];

  // Mock data for popular services
  const popularServices = [
    { name: "Chăm sóc da cơ bản", count: 42, revenue: "4.200.000 đ" },
    { name: "Trị mụn chuyên sâu", count: 28, revenue: "5.600.000 đ" },
    { name: "Trẻ hóa da", count: 30, revenue: "6.000.000 đ" },
  ];

  // Chart data for service distribution
  const serviceDistribution = [
    { name: "Chăm sóc da cơ bản", percentage: 18 },
    { name: "Trị mụn chuyên sâu", percentage: 12 },
    { name: "Trẻ hóa da", percentage: 13 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <h1 className="text-xl font-bold mb-6">Quản lý hệ thống</h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {statistics.map((stat, index) => (
          <div key={index} className="bg-white p-4 rounded-md shadow">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-gray-500 text-sm">{stat.title}</h3>
              <div className="text-gray-400">{stat.icon}</div>
            </div>
            <div className="font-bold text-2xl mb-1">{stat.value}</div>
            <div
              className={`text-xs ${
                stat.change.includes("+") ? "text-green-500" : "text-red-500"
              }`}
            >
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      {/* Main content area with two sections */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Appointment section - takes 3 columns on large screens */}
        <div className="lg:col-span-3 bg-white rounded-md shadow p-4">
          <div className="flex justify-between items-center mb-1">
            <h2 className="font-semibold text-lg">Lịch đặt gần đây</h2>
            <button className="text-blue-600 hover:underline text-sm">
              Xem tất cả
            </button>
          </div>
          <p className="text-gray-500 text-sm mb-4">
            Danh sách các lịch đặt mới nhất
          </p>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white">
                <tr>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider"
                  >
                    Khách hàng
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider"
                  >
                    Dịch vụ
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider"
                  >
                    Thời gian
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider"
                  >
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {appointments.map((appointment, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {appointment.customer}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {appointment.service}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {appointment.time}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span
                        className={`inline-flex px-3 py-1 text-xs rounded-full font-medium ${
                          appointment.status === "Đã hoàn thành"
                            ? "bg-green-100 text-green-800"
                            : appointment.status === "Đang chờ"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {appointment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Popular services section - takes 2 columns on large screens */}
        <div className="lg:col-span-2 bg-white rounded-md shadow p-4">
          <div className="flex justify-between items-center mb-1">
            <h2 className="font-semibold text-lg">Dịch vụ phổ biến</h2>
            <button className="text-blue-600 hover:underline text-sm">
              Quản lý dịch vụ
            </button>
          </div>
          <p className="text-gray-500 text-sm mb-4">
            Dịch vụ được đặt nhiều nhất
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-3 text-sm font-medium text-gray-500 mb-2">
              <div>Tên dịch vụ</div>
              <div className="text-center">Số lượt đặt</div>
              <div className="text-right">Doanh thu</div>
            </div>

            {popularServices.map((service, index) => (
              <div
                key={index}
                className="grid grid-cols-3 items-center py-2 border-b border-gray-100"
              >
                <div className="font-medium">{service.name}</div>
                <div className="text-center">{service.count}</div>
                <div className="text-right font-medium">{service.revenue}</div>
              </div>
            ))}

            <div className="mt-6">
              {serviceDistribution.map((item, index) => (
                <div key={index} className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item.name}</span>
                    <span>{item.percentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: "#ec4899",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
