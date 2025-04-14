import { useNavigate } from "react-router-dom";
import blogImg1 from "../../assets/blog/blogImg1.avif";
import PropTypes from "prop-types";

function CardBlog({ blog }) {
  const navigate = useNavigate();

  // Kiểm tra blog là object hợp lệ
  if (!blog || typeof blog !== "object") {
    console.error("Invalid blog data provided to CardBlog:", blog);
    return null;
  }

  // Destructure với fallback chỉ khi cần thiết
  const { id, title, content, excerpt, author, createdAt, thumbnailUrl } = blog;

  // Format ngày
  const formatDate = (dateString) => {
    if (!dateString) return "Đang cập nhật";

    try {
      // Nếu là string ISO date
      if (dateString.includes("T")) {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN");
      }

      // Nếu đã định dạng sẵn
      return dateString;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Đang cập nhật";
    }
  };

  // Sử dụng excerpt nếu có, nếu không thì dùng content được cắt ngắn
  const displayContent =
    excerpt ||
    (content
      ? content.length > 100
        ? content.substring(0, 100) + "..."
        : content
      : "Đang tải nội dung...");

  // Hàm xử lý khi nhấn nút xem chi tiết
  const handleViewDetail = () => {
    // Check if id exists and is valid (not undefined, null, empty string, etc.)
    if (id !== undefined && id !== null && id !== "") {
      navigate(`/blog/${id}`);
    } else {
      console.error(
        "Cannot navigate to blog detail: ID is undefined or invalid",
        blog
      );
      // Improved error message
      alert(
        "Không thể xem chi tiết bài viết này. ID bài viết không hợp lệ hoặc chưa được tải."
      );
    }
  };

  return (
    <div className="w-[470px] rounded-[10px] overflow-hidden bg-white border border-black/10 hover:shadow-xl hover:border-transparent group flex flex-col h-full">
      <div className="w-full h-[350px] overflow-hidden">
        <img
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out"
          src={thumbnailUrl || blogImg1}
          alt={title || "Bài viết"}
        />
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center space-x-2 text-black/50">
          <i className="fa-solid fa-calendar-days"></i>
          <span>{formatDate(createdAt)}</span>
          <i className="fa-solid fa-circle text-[5px] text-black/30 "></i>
          <span>{author || "Đang cập nhật"}</span>
        </div>
        <h4 className="font-semibold text-2xl mb-5">
          {title || "Đang tải tiêu đề..."}
        </h4>
        <span className="text-black/60 flex-grow">{displayContent}</span>
        <button
          className="mt-3 w-full"
          onClick={handleViewDetail}
          disabled={!id}
        >
          Xem chi tiết
        </button>
      </div>
    </div>
  );
}

CardBlog.propTypes = {
  blog: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    content: PropTypes.string,
    excerpt: PropTypes.string,
    author: PropTypes.string,
    createdAt: PropTypes.string,
    image: PropTypes.string,
  }).isRequired,
};

export default CardBlog;
