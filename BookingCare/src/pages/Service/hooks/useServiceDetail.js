import { useState, useEffect, useMemo } from "react";
import ServiceService from "../../../../services/ServiceService";

// Tạo cache ở mức module để lưu trữ chi tiết dịch vụ đã tải
const detailsCache = {};
const cacheTimes = {};
const CACHE_EXPIRY = 10 * 60 * 1000; // 10 phút

export default function useServiceDetail(id) {
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(!detailsCache[id]);
  const [error, setError] = useState(null);

  // Kiểm tra xem cache cho dịch vụ này còn hiệu lực không
  const isCacheValid = useMemo(() => {
    const now = Date.now();
    return detailsCache[id] && cacheTimes[id] && (now - cacheTimes[id] < CACHE_EXPIRY);
  }, [id]);

  useEffect(() => {
    const fetchServiceDetail = async () => {
      if (!id) {
        setError("ID dịch vụ không hợp lệ");
        setLoading(false);
        return;
      }

      // Kiểm tra nếu dữ liệu đã có trong cache và còn hiệu lực
      if (isCacheValid) {
        console.log("Using cached data for service:", id);
        setService(detailsCache[id]);
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        const data = await ServiceService.getServiceById(id);
        
        if (!data) {
          setError("Không tìm thấy thông tin dịch vụ");
          setLoading(false);
          return;
        }
        
        // Lưu vào cache
        detailsCache[id] = data;
        cacheTimes[id] = Date.now();
        
        setService(data);
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error("Error fetching service details:", err);
        setError("Không thể tải thông tin dịch vụ. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchServiceDetail();
  }, [id, isCacheValid]);

  return {
    service,
    loading,
    error
  };
} 