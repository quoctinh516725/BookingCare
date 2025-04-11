import React, { useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import SpecialistService from "../../../../services/SpecialistService";
import { MessageContext } from "../../../contexts/MessageProvider";

const SpecialistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const message = useContext(MessageContext);

  // Query để lấy dữ liệu chuyên gia
  const { data: specialist, isLoading, isError, error } = useQuery({
    queryKey: ["specialist", id],
    queryFn: () => SpecialistService.getSpecialistById(id),
    onError: (error) => {
      message.error(`Lỗi khi tải thông tin chuyên gia: ${error.message}`);
    }
  });

  // Hàm render các sao dựa trên đánh giá
  const renderStars = (rating) => {
    if (rating === undefined || rating === null) return "Chưa có đánh giá";
    
    const stars = [];
    const ratingValue = Math.round(rating);
    
    for (let i = 1; i <= 5; i++) {
      if (i <= ratingValue) {
        stars.push(<i key={i} className="fas fa-star text-yellow-400"></i>);
      } else {
        stars.push(<i key={i} className="far fa-star text-yellow-400"></i>);
      }
    }
    
    return (
      <div className="flex items-center">
        <div className="flex">{stars}</div>
        <span className="ml-2 text-gray-600">{rating?.toFixed(1) || 'N/A'}</span>
      </div>
    );
  };

  // Hàm quay lại trang danh sách
  const handleBack = () => {
    navigate("/admin/specialists");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
          <p className="mt-3 text-gray-700">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-500 text-center mb-4">
            <i className="fas fa-exclamation-circle text-5xl"></i>
          </div>
          <h2 className="text-xl font-bold text-center text-gray-800 mb-2">Đã xảy ra lỗi</h2>
          <p className="text-gray-600 text-center mb-4">{error?.message || "Không thể tải thông tin chuyên gia"}</p>
          <button
            onClick={handleBack}
            className="w-full bg-pink-500 text-white py-2 px-4 rounded hover:bg-pink-600 transition-colors"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  if (!specialist) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
          <div className="text-yellow-500 text-center mb-4">
            <i className="fas fa-exclamation-triangle text-5xl"></i>
          </div>
          <h2 className="text-xl font-bold text-center text-gray-800 mb-2">Không tìm thấy dữ liệu</h2>
          <p className="text-gray-600 text-center mb-4">Chuyên gia này không tồn tại hoặc đã bị xóa</p>
          <button
            onClick={handleBack}
            className="w-full bg-pink-500 text-white py-2 px-4 rounded hover:bg-pink-600 transition-colors"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  // Format họ tên đầy đủ
  const fullName = `${specialist.firstName || ''} ${specialist.lastName || ''}`.trim();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Nút quay lại và tiêu đề */}
          <div className="flex items-center mb-6">
            <button
              onClick={handleBack}
              className="mr-4 text-gray-500 hover:text-pink-500 transition-colors"
            >
              <i className="fas fa-arrow-left text-xl"></i>
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Chi tiết chuyên gia</h1>
          </div>

          {/* Thông tin chuyên gia */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Phần header với avatar và thông tin cơ bản */}
            <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start border-b border-gray-200">
              <div className="w-32 h-32 flex-shrink-0 mb-4 sm:mb-0 sm:mr-6">
                <img 
                  src={specialist.avatarUrl || "https://via.placeholder.com/150?text=No+Image"} 
                  alt={fullName}
                  className="w-full h-full object-cover rounded-full shadow"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/150?text=Error";
                  }}
                />
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-xl font-bold text-gray-800 mb-1">{fullName}</h2>
                <p className="text-pink-500 font-medium mb-3">{specialist.specialty || "Chưa cập nhật chuyên môn"}</p>
                
                <div className="flex flex-wrap justify-center sm:justify-start gap-4 mb-4">
                  <div className="flex items-center text-gray-600">
                    <i className="fas fa-envelope mr-2"></i>
                    <span>{specialist.email || "Chưa cập nhật"}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <i className="fas fa-phone mr-2"></i>
                    <span>{specialist.phone || "Chưa cập nhật"}</span>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center sm:justify-start gap-6">
                  <div>
                    <span className="text-sm text-gray-500 block mb-1">Kinh nghiệm</span>
                    <span className="font-medium">{specialist.experience || "Chưa cập nhật"}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 block mb-1">Đánh giá</span>
                    {renderStars(specialist.rating)}
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 block mb-1">Trạng thái</span>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      specialist.status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800' 
                      : specialist.status === 'INACTIVE'
                      ? 'bg-gray-100 text-gray-800'
                      : specialist.status === 'ON_LEAVE'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                    }`}>
                      {specialist.status === 'ACTIVE' 
                      ? 'Đang hoạt động' 
                      : specialist.status === 'INACTIVE'
                      ? 'Tạm ngưng'
                      : specialist.status === 'ON_LEAVE'
                      ? 'Đang nghỉ'
                      : 'Đã chấm dứt'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Phần chi tiết */}
            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Thông tin chi tiết</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="mb-3">
                      <span className="text-sm text-gray-500 block mb-1">ID người dùng</span>
                      <span className="text-gray-700">{specialist.userId || "N/A"}</span>
                    </div>
                    <div className="mb-3">
                      <span className="text-sm text-gray-500 block mb-1">Tài khoản</span>
                      <span className="text-gray-700">{specialist.username || "N/A"}</span>
                    </div>
                    <div className="mb-3">
                      <span className="text-sm text-gray-500 block mb-1">Bằng cấp/Chứng chỉ</span>
                      <span className="text-gray-700">{specialist.qualification || "Chưa cập nhật"}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 block mb-1">Giờ làm việc</span>
                      <span className="text-gray-700">{specialist.workingHours || "Chưa cập nhật"}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Mô tả/Tiểu sử</h3>
                  <div className="bg-gray-50 rounded-lg p-4 text-gray-700">
                    {specialist.biography || specialist.description || "Chưa có mô tả chi tiết về chuyên gia này."}
                  </div>
                </div>
              </div>

              {/* Ảnh bổ sung */}
              {specialist.images && specialist.images.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Thư viện ảnh</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {specialist.images.map((image, index) => (
                      <div key={index} className="relative h-40 rounded-lg overflow-hidden bg-gray-100">
                        <img 
                          src={image} 
                          alt={`Ảnh ${index + 1} của ${fullName}`} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/300?text=Error+Loading";
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Các nút tác vụ */}
            <div className="px-6 sm:px-8 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <Link
                to={`/admin/specialists/edit/${specialist.id}`}
                className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors mr-3"
              >
                <i className="fas fa-edit mr-2"></i>
                Chỉnh sửa
              </Link>
              <button
                onClick={handleBack}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Quay lại
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialistDetail; 