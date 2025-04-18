import React from "react";
import { useServiceCache } from "../contexts/ServiceCacheContext";

const ServiceSelection = ({ selectedServices, onServiceChange }) => {
  const { services, loading, error } = useServiceCache();

  const getEstimatedDuration = () => {
    if (selectedServices.length === 0) return "0 phút";

    const totalMinutes = selectedServices.reduce((total, serviceId) => {
      const service = services.find((s) => s.id === serviceId);
      return total + (service?.duration || 60);
    }, 0);

    // Format duration as hours and minutes
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0 && minutes > 0) {
      return `${hours} giờ ${minutes} phút`;
    } else if (hours > 0) {
      return `${hours} giờ`;
    } else {
      return `${minutes} phút`;
    }
  };

  const formatCurrencyVND = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="mb-6">
        <p className="text-xl font-semibold mb-2">
          Dịch vụ <span className="text-red-500">*</span>
        </p>
        <div className="p-4 border border-black/10 rounded-2xl flex justify-center items-center">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-[var(--primary-color)] rounded-full animate-spin mr-2"></div>
          <span>Đang tải danh sách dịch vụ...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-6">
        <p className="text-xl font-semibold mb-2">
          Dịch vụ <span className="text-red-500">*</span>
        </p>
        <div className="p-4 border border-black/10 rounded-2xl bg-red-50 text-red-600">
          <p>{error}</p>
          <button 
            className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
            onClick={() => window.location.reload()}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <p className="text-xl font-semibold mb-2">
        Dịch vụ <span className="text-red-500">*</span>
      </p>
      <div className="p-4 border border-black/10 rounded-2xl">
        {services.map((service, index) => {
          return (
            <div key={index} className="flex items-center mb-5">
              <input
                type="checkbox"
                name="service"
                id={`service-${service.id}`}
                className="accent-[var(--primary-color)] w-4 h-4 mx-4 cursor-pointer"
                onChange={(e) => onServiceChange(e, service.id)}
                checked={selectedServices.includes(service.id)}
              />
              <div className="mr-auto">
                <h5 className="font-semibold">{service.name}</h5>
                <p className="text-black/50">{service.desc}</p>
                <div className="space-x-1 text-black/50">
                  <i className="fa-regular fa-clock"></i>
                  <span>{service.duration} Phút</span>
                </div>
              </div>
              <span className="font-semibold">
                {formatCurrencyVND(service.price)}
              </span>
            </div>
          );
        })}
        {selectedServices.length > 0 && (
          <div className="mt-2 border-t border-gray-200 pt-2 flex justify-between items-center">
            <div className="text-gray-700">
              <span className="font-medium">Tổng thời gian: </span>
              <span>{getEstimatedDuration()}</span>
            </div>
            <div className="text-gray-700">
              <span className="font-medium">Đã chọn: </span>
              <span>{selectedServices.length} dịch vụ</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceSelection; 