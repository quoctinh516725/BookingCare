import React, { createContext, useState, useContext, useEffect } from "react";
import ServiceService from "../../../../services/ServiceService";

const ServiceCacheContext = createContext();

export const useServiceCache = () => useContext(ServiceCacheContext);

const LOCAL_STORAGE_KEY = "bookingcare_services_cache";
const CACHE_DURATION = 30 * 60 * 1000; // 30 phút tính bằng milliseconds

export const ServiceCacheProvider = ({ children }) => {
  // Khởi tạo state từ localStorage nếu có
  const [services, setServices] = useState(() => {
    try {
      const cachedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        const now = new Date().getTime();
        // Kiểm tra cache có còn thời hạn không
        if (data && timestamp && now - timestamp < CACHE_DURATION) {
          console.log("Sử dụng cache dịch vụ từ localStorage");
          return data;
        }
      }
      return [];
    } catch (err) {
      console.error("Lỗi khi đọc cache từ localStorage:", err);
      return [];
    }
  });

  const [loading, setLoading] = useState(services.length === 0);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(() => {
    try {
      const cachedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cachedData) {
        const { timestamp } = JSON.parse(cachedData);
        return timestamp || null;
      }
      return null;
    } catch (err) {
      console.error("Lỗi khi đọc cache từ localStorage:", err);
      return null;  
    }
  });

  const saveToLocalStorage = (data, timestamp) => {
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({ data, timestamp })
      );
    } catch (err) {
      console.error("Lỗi khi lưu cache vào localStorage:", err);
    }
  };

  const fetchServices = async (forceRefresh = false) => {
    // Kiểm tra xem có cần tải lại dữ liệu không
    const now = new Date().getTime();

    if (
      !forceRefresh &&
      services.length > 0 &&
      lastFetchTime &&
      now - lastFetchTime < CACHE_DURATION
    ) {
      // Sử dụng dữ liệu đã cache
      console.log("Sử dụng cache dịch vụ");
      return services;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("Đang tải mới dữ liệu dịch vụ từ server");
      const servicesData = await ServiceService.getAllServices();
      
      // Lưu vào state
      setServices(servicesData);
      
      // Lưu timestamp hiện tại
      const currentTime = new Date().getTime();
      setLastFetchTime(currentTime);
      
      // Lưu vào localStorage
      saveToLocalStorage(servicesData, currentTime);
      
      return servicesData;
    } catch (error) {
      console.error("Lỗi khi tải dịch vụ:", error);
      setError("Không thể tải danh sách dịch vụ");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Tải dịch vụ lần đầu nếu chưa có dữ liệu
  useEffect(() => {
    if (services.length === 0) {
      fetchServices();
    }
  }, []);

  // Xuất ra giá trị context
  const value = {
    services,
    loading,
    error,
    fetchServices,
    lastFetchTime,
  };

  return (
    <ServiceCacheContext.Provider value={value}>
      {children}
    </ServiceCacheContext.Provider>
  );
}; 