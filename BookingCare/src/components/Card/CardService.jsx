import { useNavigate } from "react-router-dom";
import serviceImg1 from "../../assets/services/serviceImg1.jpg";
import PropTypes from "prop-types";

function CardService({ service }) {
  const navigate = useNavigate();

  // Kiểm tra service là object hợp lệ
  if (!service || typeof service !== "object") {
    console.error("Invalid service data provided to CardService:", service);
    return null;
  }

  // Destructure với fallback chỉ khi cần thiết
  const { id, name, description, price = 0, duration = 0, image } = service;

  // Format giá
  const formattedPrice =
    new Intl.NumberFormat("vi-VN").format(price || 0) + " ₫";

  // Hàm xử lý khi nhấn nút xem chi tiết
  const handleViewDetail = () => {
    // Check if id exists and is valid (not undefined, null, empty string, etc.)
    if (id !== undefined && id !== null && id !== "") {
      navigate(`/service/${id}`);
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
  };

  return (
    <div className="w-[470px] rounded-[10px] overflow-hidden bg-white border border-black/10 hover:shadow-xl hover:border-transparent group">
      <div className="overflow-hidden">
        <img
          className="w-full h-[245px] object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out"
          src={image || serviceImg1}
          alt={name || "Dịch vụ"}
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
        <p className="mt-5 mb-4">
          {description || "Đang tải thông tin chi tiết..."}
        </p>
        <div className="mt-auto">
          <button
            className="text-white font-semibold w-full"
            onClick={handleViewDetail}
            disabled={!id}
          >
            Xem chi tiết
          </button>
        </div>
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
