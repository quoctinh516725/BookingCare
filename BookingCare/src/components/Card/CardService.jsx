import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import serviceImg1 from "../../assets/services/serviceImg1.jpg";
import PropTypes from "prop-types";
import ServiceService from "../../../services/ServiceService"; 

// Biến lưu trữ ở mức module để cache dữ liệu
const prefetchedServices = {};
const prefetchStatus = {};

function CardService({ service }) {
  const navigate = useNavigate();
  const [isHovering, setIsHovering] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [contentReady, setContentReady] = useState(false);

  // Mark content as ready when service data is valid
  useEffect(() => {
    if (service && service.id) {
      setContentReady(true);
    }
  }, [service]);

  // Prefetch dữ liệu khi hover
  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
    
    // Chỉ prefetch nếu có ID hợp lệ và chưa prefetch trước đó
    if (service?.id && !prefetchedServices[service.id] && !prefetchStatus[service.id]) {
      // Đánh dấu đang prefetch để tránh trùng lặp
      prefetchStatus[service.id] = true;
      
      // Tải trước dữ liệu chi tiết
      ServiceService.getServiceById(service.id)
        .then(data => {
          if (data) {
            // Lưu vào cache
            prefetchedServices[service.id] = data;
            console.log("Prefetched service detail:", service.id);
          }
        })
        .catch(err => {
          console.error("Error prefetching service:", err);
          // Reset status on error to allow retry later
          prefetchStatus[service.id] = false;
        });
    }
  }, [service?.id]);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
  }, []);

  // Xử lý khi ảnh tải xong
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  // Xử lý khi ảnh lỗi
  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true); // Vẫn đánh dấu là đã tải để loại bỏ skeleton
  }, []);

  // Hàm xử lý khi nhấn nút xem chi tiết
  const handleViewDetail = useCallback(() => {
    // Check if id exists and is valid (not undefined, null, empty string, etc.)
    if (service?.id !== undefined && service.id !== null && service.id !== "") {
      navigate(`/service/${service.id}`);
    } else {
      console.error(
        "Cannot navigate to service detail: ID is undefined or invalid",
        service
      );
      // Improved error message
      alert(
        "Không thể xem chi tiết dịch vụ này. ID dịch vụ không hợp lệ hoặc chưa được tải."
      );
    }
  }, [navigate, service]);

  // Kiểm tra service là object hợp lệ
  if (!service || typeof service !== "object") {
    console.error("Invalid service data provided to CardService:", service);
    return null;
  }

  // Destructure với fallback chỉ khi cần thiết
  const { name, description, price = 0, duration = 0, image } = service;

  // Format giá
  const formattedPrice =
    new Intl.NumberFormat("vi-VN").format(price || 0) + " ₫";

  return (
    <div 
      className={`w-[470px] rounded-[10px] overflow-hidden bg-white border border-black/10 ${isHovering ? 'shadow-xl border-transparent' : ''} transition-all duration-300`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="overflow-hidden h-[245px] relative">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        <img
          className={`w-full h-[245px] object-cover ${isHovering ? 'scale-110' : ''} transition-transform duration-500 ease-in-out ${
            !imageLoaded ? 'opacity-0' : 'opacity-100'
          }`}
          src={imageError ? serviceImg1 : (image || serviceImg1)}
          alt={name || "Dịch vụ"}
          loading="lazy"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </div>
      <div className="p-6 flex flex-col h-[calc(100%-245px)]">
        <h4 className="font-semibold text-2xl">{name || "Đang tải..."}</h4>
        <div className="flex justify-between items-center">
          <span className="font-semibold text-[var(--primary-color)]">
            {formattedPrice}
          </span>
          <span className="space-x-2 text-black/60">
            <i className="fa-regular fa-clock"></i>
            <span>{duration} Phút</span>
          </span>
        </div>
        <div className={`mt-5 mb-4 ${!contentReady ? 'animate-pulse' : ''}`}>
          <p className="line-clamp-3">
            {contentReady ? description : "Đang tải thông tin chi tiết..."}
          </p>
        </div>
        <button
          className="text-white font-semibold w-full mt-auto bg-[var(--primary-color)] py-2 rounded-md transition-colors hover:bg-[var(--primary-color-dark)]"
          onClick={handleViewDetail}
          disabled={!service.id}
        >
          Xem chi tiết
        </button>
      </div>
    </div>
  );
}

CardService.propTypes = {
  service: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    description: PropTypes.string,
    price: PropTypes.number,
    duration: PropTypes.number,
    image: PropTypes.string,
  }).isRequired,
};

export default CardService;
