import React, { useState, useEffect, lazy, Suspense } from "react";
import AdminService from "../../../services/AdminService";
import { Link } from "react-router-dom";

// Lazy load components
const StatisticsCards = lazy(() => import('./components/StatisticsCards'));
const AppointmentsTable = lazy(() => import('./components/AppointmentsTable'));
const PopularServicesPanel = lazy(() => import('./components/PopularServicesPanel'));

// Cache mechanism with expiry time
const CACHE_KEY = 'admin_dashboard_data';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

const AdminDashboard = () => {
  // State to store data
  const [dashboardData, setDashboardData] = useState({
    statistics: [],
    appointments: [],
    popularServices: [],
    serviceDistribution: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Main function to load dashboard data
  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check cache first
      const cachedData = checkCache();
      
      if (cachedData) {
        console.log("Using cached dashboard data");
        setDashboardData(cachedData);
        setIsLoading(false);
        
        // Refresh cache in background if needed
        const cacheAge = Date.now() - cachedData.timestamp;
        if (cacheAge > CACHE_EXPIRY / 2) {
          refreshDataInBackground();
        }
        return;
      }
      
      // No valid cache, fetch fresh data
      await fetchAllDashboardData();
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setError("Không thể tải dữ liệu dashboard. Vui lòng thử lại sau!");
      setIsLoading(false);
    }
  };

  // Check if we have valid cached data
  const checkCache = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      
      const parsedCache = JSON.parse(cached);
      const cacheAge = Date.now() - parsedCache.timestamp;
      
      // Return cached data if still valid
      if (cacheAge < CACHE_EXPIRY) {
        return parsedCache;
      }
      
      return null;
    } catch (error) {
      console.error("Error reading cache:", error);
      return null;
    }
  };

  // Save data to cache
  const saveToCache = (data) => {
    try {
      const cacheData = {
        ...data,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error("Error saving to cache:", error);
    }
  };

  // Refresh data in background without showing loading state
  const refreshDataInBackground = async () => {
    try {
      console.log("Refreshing dashboard data in background");
      await fetchAllDashboardData(false);
    } catch (error) {
      console.error("Error refreshing background data:", error);
    }
  };

  // Fetch all dashboard data at once
  const fetchAllDashboardData = async (updateLoadingState = true) => {
    try {
      // Use Promise.all to fetch data in parallel
      const [statsData, bookingsData, servicesData] = await Promise.all([
        AdminService.getAdminStats(),
        AdminService.getRecentBookings(10),
        AdminService.getPopularServices()
      ]);

      // Process statistics
      const formattedStats = processStatisticsData(statsData);
      
      // Process appointments
      const formattedAppointments = processAppointmentsData(bookingsData);
      
      // Process services data
      const { formattedServices, distributionData } = processServicesData(servicesData);

      // Combine all data
      const newData = {
        statistics: formattedStats,
        appointments: formattedAppointments,
        popularServices: formattedServices,
        serviceDistribution: distributionData
      };

      // Update state with new data
      setDashboardData(newData);
      
      // Save to cache
      saveToCache(newData);
      
      if (updateLoadingState) {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      if (updateLoadingState) {
        setError("Không thể tải dữ liệu dashboard. Vui lòng thử lại sau!");
        setIsLoading(false);
      }
      throw error;
    }
  };

  // Process statistics data
  const processStatisticsData = (statsData) => {
    return [
      {
        title: "Người dùng",
        value: statsData.userCount || "0",
        change: `${statsData.userGrowth > 0 ? "+" : ""}${
          statsData.userGrowth || 0
        }% so với tháng trước`,
        iconName: "fas fa-users",
        iconColor: "text-blue-500"
      },
      {
        title: "Dịch vụ",
        value: statsData.serviceCount || "0",
        change: `${statsData.serviceGrowth > 0 ? "+" : ""}${
          statsData.serviceGrowth || 0
        }% so với tháng trước`,
        iconName: "fas fa-concierge-bell",
        iconColor: "text-purple-500"
      },
      {
        title: "Chuyên viên",
        value: statsData.staffCount || "0",
        change: `${statsData.staffGrowth > 0 ? "+" : ""}${
          statsData.staffGrowth || 0
        } người mới`,
        iconName: "fas fa-user-check",
        iconColor: "text-blue-500"
      },
      {
        title: "Lịch đặt",
        value: statsData.bookingCount || "0",
        change: `${statsData.bookingGrowth > 0 ? "+" : ""}${
          statsData.bookingGrowth || 0
        }% so với tháng trước`,
        iconName: "fas fa-calendar-alt",
        iconColor: "text-blue-500"
      },
      {
        title: "Doanh thu",
        value: `${new Intl.NumberFormat("vi-VN").format(
          statsData.revenue || 0
        )} đ`,
        change: `${statsData.revenueGrowth > 0 ? "+" : ""}${
          statsData.revenueGrowth || 0
        }% so với tháng trước`,
        iconName: "fas fa-dollar-sign",
        iconColor: "text-green-500"
      },
    ];
  };

  // Process appointments data
  const processAppointmentsData = (bookingsData) => {
    if (!Array.isArray(bookingsData)) return [];
    
    return bookingsData.map((booking) => {
      // Create service names string
      let serviceNames = "Chưa có dịch vụ";
      if (booking.services && booking.services.length > 0) {
        serviceNames = booking.services.map((s) => s.name).join(", ");
      }

      // Format time
      let formattedTime = booking.formattedDateTime || "Chưa có thời gian";
      if (!booking.formattedDateTime && booking.appointmentTime) {
        formattedTime = new Date(booking.appointmentTime).toLocaleString(
          "vi-VN"
        );
      }

      return {
        customer: booking.customerName || "Khách hàng",
        service: serviceNames,
        time: formattedTime,
        status: booking.status || "PENDING",
      };
    });
  };

  // Process services data
  const processServicesData = (servicesData) => {
    if (!Array.isArray(servicesData) || servicesData.length === 0) {
      return { formattedServices: [], distributionData: [] };
    }

    // Format popular services
    const formattedServices = servicesData.map((service) => ({
      name: service.name || "Dịch vụ",
      count: service.bookingCount || 0,
      revenue: `${new Intl.NumberFormat("vi-VN").format(
        service.revenue || 0
      )} đ`,
    }));

    // Create data for service distribution chart
    const totalBookings = servicesData.reduce(
      (sum, service) => sum + (service.bookingCount || 0),
      0
    );
    
    const distributionData = servicesData.map((service) => ({
      name: service.name || "Dịch vụ",
      percentage:
        totalBookings > 0
          ? Math.round(((service.bookingCount || 0) / totalBookings) * 100)
          : 0,
    }));

    return { formattedServices, distributionData };
  };

  // Function to render appointment status
  const renderAppointmentStatus = (status) => {
    let displayStatus = status;
    let statusClass = "";

    switch (status) {
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
      <span
        className={`inline-flex px-3 py-1 text-xs rounded-full font-medium ${statusClass}`}
      >
        {displayStatus}
      </span>
    );
  };

  // Retry loading data
  const handleRetry = () => {
    loadDashboardData();
  };

  // Loading placeholder for statistics
  const StatisticsPlaceholder = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-white p-4 rounded-md shadow animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <h1 className="text-xl font-bold mb-6">Quản lý hệ thống</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
          <strong className="font-bold">Lỗi! </strong>
          <span className="block sm:inline">{error}</span>
          <button
            onClick={handleRetry}
            className="ml-3 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Statistics Cards - Always render immediately for better LCP */}
      {isLoading ? (
        <StatisticsPlaceholder />
      ) : (
        <Suspense fallback={<StatisticsPlaceholder />}>
          <StatisticsCards statistics={dashboardData.statistics} />
        </Suspense>
      )}

      {/* Main content area */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 bg-white rounded-md shadow p-4 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2 bg-white rounded-md shadow p-4 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Appointments section */}
          <div className="lg:col-span-3 bg-white rounded-md shadow p-4">
            <div className="flex justify-between items-center mb-1">
              <h2 className="font-semibold text-lg">Lịch đặt gần đây</h2>
              <span className="text-[var(--primary-color)] font-medium text-sm">
                <Link to="/admin/appointments">Xem tất cả</Link>
              </span>
            </div>
            <p className="text-gray-500 text-sm mb-4">
              Danh sách các lịch đặt mới nhất
            </p>

            <Suspense fallback={<div className="text-center py-6">Đang tải...</div>}>
              <AppointmentsTable 
                appointments={dashboardData.appointments} 
                renderStatus={renderAppointmentStatus} 
              />
            </Suspense>
          </div>

          {/* Popular services section */}
          <div className="lg:col-span-2 bg-white rounded-md shadow p-4">
            <div className="flex justify-between items-center mb-1">
              <h2 className="font-semibold text-lg">Dịch vụ phổ biến</h2>
              <span className="text-[var(--primary-color)] font-medium text-sm">
                <Link to="/admin/services">Quản lý dịch vụ</Link>
              </span>
            </div>
            <p className="text-gray-500 text-sm mb-4">
              Dịch vụ được đặt nhiều nhất
            </p>

            <Suspense fallback={<div className="text-center py-6">Đang tải...</div>}>
              <PopularServicesPanel 
                services={dashboardData.popularServices}
                distribution={dashboardData.serviceDistribution}
              />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
