import { useState, useEffect, useMemo, useRef } from "react";
import SpecialistService from "../../../../services/SpecialistService";

// Tạo cache ở mức module để lưu trữ chi tiết chuyên gia đã tải
const detailsCache = {};
const cacheTimes = {};
const CACHE_EXPIRY = 10 * 60 * 1000; // 10 phút

export default function useSpecialistDetail(id) {
  const [specialist, setSpecialist] = useState(null);
  const [loading, setLoading] = useState(!detailsCache[id]);
  const [error, setError] = useState(null);
  const hasLoadedRef = useRef(false);

  // Kiểm tra xem cache cho chuyên gia này còn hiệu lực không
  const isCacheValid = useMemo(() => {
    const now = Date.now();
    return detailsCache[id] && cacheTimes[id] && (now - cacheTimes[id] < CACHE_EXPIRY);
  }, [id]);

  // Tải chi tiết chuyên gia - cách tiếp cận mới:
  // 1. Nếu có cache, hiển thị ngay lập tức
  // 2. Nếu không, hiển thị skeleton loading và tải dữ liệu
  useEffect(() => {
    // Reset trạng thái khi ID thay đổi
    if (!isCacheValid) {
      setSpecialist(null);
      setLoading(true);
      hasLoadedRef.current = false;
    }

    // Validate ID before making the API call
    if (!id || id === "undefined") {
      setError("ID chuyên viên không hợp lệ. Vui lòng chọn một chuyên viên từ danh sách.");
      setLoading(false);
      return;
    }

    // Nếu đã tải rồi, không tải lại
    if (hasLoadedRef.current) {
      return;
    }

    // Tạo hàm tải dữ liệu
    const fetchSpecialistDetail = async () => {
      // Kiểm tra nếu dữ liệu đã có trong cache và còn hiệu lực
      if (isCacheValid) {
        console.log("Using cached data for specialist:", id);
        setSpecialist(detailsCache[id]);
        setLoading(false);
        return;
      }

      try {
        // Đánh dấu đã tải để tránh tải nhiều lần
        hasLoadedRef.current = true;
        setLoading(true);

        // Tải dữ liệu chuyên gia
        const data = await SpecialistService.getSpecialistById(id);
        
        if (!data) {
          setError("Không tìm thấy thông tin chuyên viên");
          setLoading(false);
          return;
        }
        
        // Lưu vào cache
        detailsCache[id] = data;
        cacheTimes[id] = Date.now();
        
        setSpecialist(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching specialist details:", err);
        setError("Không thể tải thông tin chuyên viên. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    // Nếu có cache, sử dụng ngay lập tức
    if (isCacheValid) {
      setSpecialist(detailsCache[id]);
      setLoading(false);
    } else {
      // Nếu không có cache, bắt đầu tải dữ liệu
      fetchSpecialistDetail();
    }
  }, [id, isCacheValid]);

  // Tạo tên đầy đủ của chuyên gia
  const fullName = useMemo(() => {
    if (!specialist) return "";
    return `${specialist.firstName || ""} ${specialist.lastName || ""}`.trim();
  }, [specialist]);

  return {
    specialist,
    loading,
    error,
    fullName
  };
} 