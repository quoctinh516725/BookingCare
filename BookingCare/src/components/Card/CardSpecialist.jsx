import { useNavigate } from "react-router-dom";
import specialistImg1 from "../../assets/specialist/specialistImg1.avif";
import PropTypes from "prop-types";
import { memo, useState, useCallback, useEffect, useRef } from "react";

// Memo hóa component để tránh re-render không cần thiết
const CardSpecialist = memo(function CardSpecialist({ specialist }) {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [contentReady, setContentReady] = useState(true); // Set content ready by default
  const imageRef = useRef(null);
  const contentRef = useRef(null);
  const imageLoadTimeoutRef = useRef(null);

  // Đánh dấu content ready khi component mount
  useEffect(() => {
    setContentReady(true);
    
    // Tải hình ảnh sau khi content đã render
    imageLoadTimeoutRef.current = setTimeout(() => {
      // Nếu đây là first mount và image chưa load, bắt đầu load
      if (imageRef.current && !imageLoaded) {
        const img = imageRef.current;
        
        // Nếu ảnh đã nằm trong cache, sự kiện onLoad có thể sẽ không được gọi
        // Kiểm tra xem ảnh đã hoàn thành chưa
        if (img.complete) {
          setImageLoaded(true);
        }
      }
    }, 100); // Cho content 100ms để render trước

    return () => {
      if (imageLoadTimeoutRef.current) {
        clearTimeout(imageLoadTimeoutRef.current);
      }
    };
  }, []);
  
  // Prefetch khi hover - chỉ dùng cho visual effect
  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
  }, []);

  // Xử lý khi ảnh tải xong
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  // Xử lý lỗi ảnh
  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true); // Vẫn đánh dấu là đã tải để loại bỏ skeleton
  }, []);

  // Sử dụng useCallback để memo hóa hàm xử lý navigation
  const handleViewDetail = useCallback(() => {
    if (specialist?.id !== undefined && specialist.id !== null && specialist.id !== "") {
      navigate(`/specialist/${specialist.id}`);
    } else {
      console.error("Invalid specialist ID:", specialist);
    }
  }, [navigate, specialist]);

  // Kiểm tra specialist là object hợp lệ
  if (!specialist || typeof specialist !== "object") {
    return null;
  }

  // Destructure với fallback
  const { firstName, lastName, description, experience, avatarUrl } = specialist;

  // Tạo tên đầy đủ
  const fullName =
    firstName && lastName
      ? `${firstName} ${lastName}`
      : firstName || lastName || "Chuyên viên";

  // Phân chia content và image thành 2 phần riêng biệt
  return (
    <div 
      className={`w-[470px] rounded-[10px] overflow-hidden bg-white border border-black/10 ${
        isHovering ? 'shadow-xl border-transparent' : ''
      } transition-all duration-300`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ contain: 'content' }} // Improve CSS containment
    >
      {/* Phân chia thành 2 phần: content và image */}
      <div className="grid grid-cols-1">
        {/* CONTENT - hiển thị ngay khi component mount */}
        <div 
          ref={contentRef}
          className={`p-6 ${contentReady ? 'opacity-100' : 'opacity-0'}`} 
          style={{ order: 2, transitionProperty: 'opacity', transitionDuration: '150ms' }}
        >
          <div className="flex flex-col justify-between items-center">
            <h4 className="font-semibold text-3xl mb-5">{fullName}</h4>
            <span className="font-semibold text-[var(--primary-color)]">
              {description || "Chuyên gia chăm sóc da"}
            </span>
            <span className="space-x-2 text-black/60">{experience || ""}</span>
            <button
              className="mt-3 w-full text-white font-semibold py-2 rounded-md bg-[var(--primary-color)] transition-colors hover:bg-[var(--primary-color-dark)]"
              onClick={handleViewDetail}
              disabled={!specialist.id}
            >
              Xem chi tiết
            </button>
          </div>
        </div>
        
        {/* IMAGE - tải sau khi content đã hiển thị */}
        <div 
          className="w-full h-[350px] overflow-hidden relative" 
          style={{ order: 1 }}
        >
          {/* Skeleton placeholder */}
          <div 
            className={`absolute inset-0 bg-gray-200 ${imageLoaded ? 'opacity-0' : 'opacity-100'}`}
            style={{ transition: 'opacity 250ms' }}
          />
          
          {/* Dùng intersection observer để tối ưu việc tải hình */}
          <img
            ref={imageRef}
            className={`w-full h-full object-cover ${
              isHovering ? 'scale-110' : ''
            } transition-transform duration-500 ease-in-out ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            src={imageError ? specialistImg1 : avatarUrl || specialistImg1}
            alt={fullName}
            onError={handleImageError}
            onLoad={handleImageLoad}
            loading="lazy"
            decoding="async"
            fetchPriority="low" // Giảm độ ưu tiên để content load trước
          />
        </div>
      </div>
    </div>
  );
});

CardSpecialist.propTypes = {
  specialist: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    description: PropTypes.string,
    experience: PropTypes.string,
    avatarUrl: PropTypes.string,
  }).isRequired,
};

CardSpecialist.displayName = "CardSpecialist";

export default CardSpecialist;
