import React, { useState, useEffect } from "react";
import UserService from "../../../services/UserService";
import { toast } from "react-toastify";

const AdminDashboard = () => {
  // State để lưu trữ dữ liệu từ API
  const [statistics, setStatistics] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [popularServices, setPopularServices] = useState([]);
  const [serviceDistribution, setServiceDistribution] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch thống kê admin
        const statsData = await UserService.getAdminStats();
        const formattedStats = [
          {
            title: "Người dùng",
            value: statsData.userCount || "0",
            change: `${statsData.userGrowth > 0 ? "+" : ""}${statsData.userGrowth || 0}% so với tháng trước`,
            icon: <i className="fas fa-users h-5 w-5 text-blue-500"></i>,
          },
          {
            title: "Dịch vụ",
            value: statsData.serviceCount || "0",
            change: `${statsData.serviceGrowth > 0 ? "+" : ""}${statsData.serviceGrowth || 0}% so với tháng trước`,
            icon: <i className="fas fa-concierge-bell h-5 w-5 text-purple-500"></i>,
          },
          {
            title: "Chuyên viên",
            value: statsData.staffCount || "0",
            change: `${statsData.staffGrowth > 0 ? "+" : ""}${statsData.staffGrowth || 0} người mới`,
            icon: <i className="fas fa-user-check h-5 w-5 text-blue-500"></i>,
          },
          {
            title: "Lịch đặt",
            value: statsData.bookingCount || "0",
            change: `${statsData.bookingGrowth > 0 ? "+" : ""}${statsData.bookingGrowth || 0}% so với tháng trước`,
            icon: <i className="fas fa-calendar-alt h-5 w-5 text-blue-500"></i>,
          },
          {
            title: "Doanh thu",
            value: `${new Intl.NumberFormat('vi-VN').format(statsData.revenue || 0)} đ`,
            change: `${statsData.revenueGrowth > 0 ? "+" : ""}${statsData.revenueGrowth || 0}% so với tháng trước`,
            icon: <i className="fas fa-dollar-sign h-5 w-5 text-green-500"></i>,
          },
        ];
        setStatistics(formattedStats);

        // Fetch lịch hẹn gần đây
        const bookingsData = await UserService.getRecentBookings(5);
        const formattedAppointments = bookingsData.map(booking => ({
          customer: booking.customerName || "Khách hàng",
          service: booking.services?.map(s => s.name).join(", ") || "Dịch vụ",
          time: booking.formattedDateTime || new Date(booking.appointmentTime).toLocaleString('vi-VN'),
          status: booking.status
        }));
        setAppointments(formattedAppointments);

        // Fetch dịch vụ phổ biến
        const servicesData = await UserService.getPopularServices();
        const formattedServices = servicesData.map(service => ({
          name: service.name || "Dịch vụ",
          count: service.bookingCount || 0,
          revenue: `${new Intl.NumberFormat('vi-VN').format(service.revenue || 0)} đ`
        }));
        setPopularServices(formattedServices);

        // Tạo dữ liệu cho biểu đồ phân phối dịch vụ
        const totalBookings = servicesData.reduce((sum, service) => sum + (service.bookingCount || 0), 0);
        const distributionData = servicesData.map(service => ({
          name: service.name || "Dịch vụ",
          percentage: totalBookings > 0 ? Math.round(((service.bookingCount || 0) / totalBookings) * 100) : 0
        }));
        setServiceDistribution(distributionData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Không thể tải dữ liệu dashboard. Vui lòng thử lại sau!");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function để render trạng thái lịch hẹn
  const renderAppointmentStatus = (status) => {
    let displayStatus = status;
    let statusClass = "";
    
    switch(status) {
      case "COMPLETED":
        displayStatus = "Đã hoàn thành";
        statusClass = "bg-green-100 text-green-800";
        break;
      case "PENDING":
        displayStatus = "Đang chờ";
        statusClass = "bg-blue-100 text-blue-800";
        break;
      case "CONFIRMED":
        displayStatus = "Đã xác nhận";
        statusClass = "bg-blue-100 text-blue-800";
        break;
      case "CANCELLED":
      case "CANCELED":
        displayStatus = "Đã hủy";
        statusClass = "bg-red-100 text-red-800";
        break;
      case "NO_SHOW":
        displayStatus = "Không đến";
        statusClass = "bg-red-100 text-red-800";
        break;
      default:
        statusClass = "bg-gray-100 text-gray-800";
    }
    
    return (
      <span className={`inline-flex px-3 py-1 text-xs rounded-full font-medium ${statusClass}`}>
        {displayStatus}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <h1 className="text-xl font-bold mb-6">Quản lý hệ thống</h1>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
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

              {appointments.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  Chưa có lịch đặt nào
                </div>
              ) : (
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
                            {renderAppointmentStatus(appointment.status)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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

              {popularServices.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  Chưa có dữ liệu về dịch vụ phổ biến
                </div>
              ) : (
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
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
