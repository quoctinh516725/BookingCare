import { useNavigate } from 'react-router-dom';
import specialistImg1 from "../../assets/specialist/specialistImg1.avif";
import PropTypes from 'prop-types';

function CardSpecialist({ specialist }) {
  const navigate = useNavigate();
  
  // Kiểm tra specialist là object hợp lệ
  if (!specialist || typeof specialist !== 'object') {
    console.error("Invalid specialist data provided to CardSpecialist:", specialist);
    return null;
  }
  
  // Destructure với fallback chỉ khi cần thiết
  const {
    id,
    firstName,
    lastName,
    description,
    experience,
    image
  } = specialist;
  
  // Tạo tên đầy đủ
  const fullName = firstName && lastName 
    ? `${firstName} ${lastName}`
    : firstName || lastName || "Chuyên viên";
  
  // Hàm xử lý khi nhấn nút xem chi tiết
  const handleViewDetail = () => {
    // Check if id exists and is valid (not undefined, null, empty string, etc.)
    if (id !== undefined && id !== null && id !== '') {
      navigate(`/specialist/${id}`);
    } else {
      console.error("Cannot navigate to specialist detail: ID is undefined or invalid", specialist);
      // Improved error message
      alert("Không thể xem chi tiết chuyên viên này. ID chuyên viên không hợp lệ hoặc chưa được tải.");
    }
  };

  return (
    <div className="w-[470px] rounded-[10px] overflow-hidden bg-white border border-black/10 hover:shadow-xl hover:border-transparent group">
      <div className="w-full h-[350px] overflow-hidden">
        <img
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out"
          src={image || specialistImg1}
          alt={fullName}
        />
      </div>
      <div className="p-6">
        <div className="flex flex-col justify-between items-center">
          <h4 className="font-semibold text-3xl mb-5">{fullName}</h4>
          <span className="font-semibold text-[var(--primary-color)]">
            {description || "Chuyên gia chăm sóc da"}
          </span>
          <span className="space-x-2 text-black/60">{experience || ""}</span>
          <button className="mt-3 w-full" onClick={handleViewDetail} disabled={!id}>
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  );
}

CardSpecialist.propTypes = {
  specialist: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    description: PropTypes.string,
    experience: PropTypes.string,
    image: PropTypes.string
  }).isRequired
};

export default CardSpecialist;
