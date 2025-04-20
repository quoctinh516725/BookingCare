import React, { useCallback } from "react";
import { useAppointments } from "../../contexts/AppointmentContext";

const AppointmentFilters = () => {
  const { 
    activeFilter, 
    setActiveFilter, 
    showCancelled, 
    setShowCancelled,
    fetchAppointments 
  } = useAppointments();

  const getFilterStyle = useCallback(
    (filterValue) => {
      const isActive = activeFilter === filterValue;
      return `px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-colors duration-200 ${
        isActive
          ? "bg-[var(--primary-color)] text-white hover:bg-[var(--primary-color)]"
          : "text-gray-500 hover:bg-gray-100"
      }`;
    },
    [activeFilter]
  );

  const handleFilterChange = (filterValue) => {
    setActiveFilter(filterValue);
  };

  const handleShowCancelledChange = (e) => {
    setShowCancelled(e.target.checked);
  };

  const handleRefresh = () => {
    fetchAppointments(true);
  };

  const getStatusText = (status) => {
    switch (status) {
      case "PENDING":
        return "Chờ xác nhận";
      case "CONFIRMED":
        return "Đã xác nhận";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status;
    }
  };

  return (
    <div className="p-4">
      <div className="flex flex-wrap md:flex-nowrap justify-between items-center mb-4">
        <div className="flex space-x-2 overflow-x-auto">
          {["Tất cả", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map(
            (status) => (
              <span
                key={status}
                className={getFilterStyle(status)}
                onClick={() => handleFilterChange(status)}
              >
                {getStatusText(status)}
              </span>
            )
          )}
        </div>
        
        <div className="flex items-center space-x-4 mt-2 md:mt-0">
          <div className="flex items-center">
            <input
              id="show-cancelled"
              type="checkbox"
              className="h-4 w-4 text-pink-500 focus:ring-pink-400 border-gray-300 rounded"
              checked={showCancelled}
              onChange={handleShowCancelledChange}
            />
            <label
              htmlFor="show-cancelled"
              className="ml-2 text-sm text-gray-700"
            >
              Hiển thị đã hủy
            </label>
          </div>
          
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1 text-blue-500 hover:text-blue-600 text-sm"
          >
            <i className="fas fa-sync-alt"></i>
            <span>Làm mới</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentFilters; 