import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import UserService from "../../../services/UserService";

function SpecialistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [specialist, setSpecialist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Validate ID before making the API call
    if (!id || id === "undefined") {
      setError(
        "ID chuyên viên không hợp lệ. Vui lòng chọn một chuyên viên từ danh sách."
      );
      setLoading(false);
      return;
    }

    const fetchSpecialistDetail = async () => {
      try {
        setLoading(true);
        const data = await UserService.getStaffById(id);
        setSpecialist(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching specialist details:", err);
        setError("Không thể tải thông tin chuyên gia. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchSpecialistDetail();
  }, [id, navigate]);

  // Hiển thị skeleton khi đang tải dữ liệu
  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-1/3 mb-5"></div>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3 h-[400px] bg-gray-200 rounded-lg"></div>
            <div className="w-full md:w-2/3">
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
              <div className="h-10 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-12 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Hiển thị thông báo lỗi
  if (error) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">
            Đã xảy ra lỗi
          </h2>
          <p className="mb-4">{error}</p>
          <Link to="/specialist" className="text-blue-500  ">
            Quay lại danh sách chuyên gia
          </Link>
        </div>
      </div>
    );
  }

  // Nếu không có dữ liệu
  if (!specialist) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Không tìm thấy chuyên gia</h2>
          <Link to="/specialist" className="text-blue-500  ">
            Quay lại danh sách chuyên gia
          </Link>
        </div>
      </div>
    );
  }

  // Tạo tên đầy đủ của chuyên gia
  const fullName = `${specialist.firstName || ""} ${
    specialist.lastName || ""
  }`.trim();

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-6">
        <Link to="/specialist" className="text-blue-500   flex items-center">
          <i className="fa fa-arrow-left mr-2"></i> Quay lại danh sách chuyên
          gia
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Hình ảnh và thông tin cơ bản */}
        <div className="w-full md:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <img
              src={
                specialist.image ||
                "https://via.placeholder.com/300x300?text=Specialist"
              }
              alt={fullName}
              className="w-40 h-40 rounded-full mx-auto mb-4 object-cover"
            />
            <h1 className="text-2xl font-bold mb-2">{fullName}</h1>
            <p className="text-[var(--primary-color)] font-semibold mb-4">
              {specialist.expertise || "Chuyên gia chăm sóc da"}
            </p>

            <div className="flex items-center justify-center text-gray-600 mb-4">
              <i className="fa-solid fa-graduation-cap mr-2"></i>
              <span>
                {specialist.qualification || "Chứng chỉ chăm sóc da quốc tế"}
              </span>
            </div>

            <div className="flex items-center justify-center text-gray-600 mb-6">
              <i className="fa-solid fa-briefcase mr-2"></i>
              <span>{specialist.experience || "5"} năm kinh nghiệm</span>
            </div>

            <Link to={`/booking?specialist=${specialist.id}`}>
              <button className="w-full py-3 text-white font-semibold rounded-md bg-[var(--primary-color)] hover:bg-[var(--primary-color-dark)] transition duration-300">
                Đặt lịch với chuyên gia
              </button>
            </Link>
          </div>

          {/* Thông tin liên hệ */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h2 className="text-xl font-bold mb-4">Thông tin liên hệ</h2>

            {specialist.email && (
              <div className="flex items-center text-gray-600 mb-3">
                <i className="fa-solid fa-envelope w-6"></i>
                <span>{specialist.email}</span>
              </div>
            )}

            {specialist.phone && (
              <div className="flex items-center text-gray-600 mb-3">
                <i className="fa-solid fa-phone w-6"></i>
                <span>{specialist.phone}</span>
              </div>
            )}

            {/* Giờ làm việc - có thể thay thế bằng dữ liệu thực tế từ API */}
            <div className="flex items-start text-gray-600">
              <i className="fa-solid fa-clock w-6 mt-1"></i>
              <div>
                <p className="mb-1">Thứ 2 - Thứ 6: 8:00 - 18:00</p>
                <p className="mb-1">Thứ 7: 8:00 - 12:00</p>
                <p>Chủ nhật: Nghỉ</p>
              </div>
            </div>
          </div>
        </div>

        {/* Thông tin chi tiết */}
        <div className="w-full md:w-2/3">
          {/* Giới thiệu */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Giới thiệu</h2>
            <p className="text-gray-700 whitespace-pre-line">
              {specialist.description ||
                `${fullName} là một chuyên gia chăm sóc da với nhiều năm kinh nghiệm trong lĩnh vực thẩm mỹ và chăm sóc sức khỏe làn da.

Với nền tảng kiến thức vững chắc và kỹ năng chuyên môn cao, chuyên gia luôn mang đến những dịch vụ chăm sóc da chất lượng và an toàn cho khách hàng.

Triết lý làm việc của chuyên gia là luôn lắng nghe nhu cầu và mong muốn của khách hàng, từ đó đưa ra những giải pháp phù hợp và hiệu quả nhất.`}
            </p>
          </div>

          {/* Chuyên môn */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Chuyên môn</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {specialist.specialties ? (
                specialist.specialties.map((specialty, index) => (
                  <div key={index} className="flex items-center">
                    <i className="fa-solid fa-check text-[var(--primary-color)] mr-2"></i>
                    <span>{specialty}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-center">
                    <i className="fa-solid fa-check text-[var(--primary-color)] mr-2"></i>
                    <span>Chăm sóc da mặt chuyên sâu</span>
                  </div>
                  <div className="flex items-center">
                    <i className="fa-solid fa-check text-[var(--primary-color)] mr-2"></i>
                    <span>Điều trị mụn và sẹo</span>
                  </div>
                  <div className="flex items-center">
                    <i className="fa-solid fa-check text-[var(--primary-color)] mr-2"></i>
                    <span>Trẻ hóa da</span>
                  </div>
                  <div className="flex items-center">
                    <i className="fa-solid fa-check text-[var(--primary-color)] mr-2"></i>
                    <span>Trị nám và tàn nhang</span>
                  </div>
                  <div className="flex items-center">
                    <i className="fa-solid fa-check text-[var(--primary-color)] mr-2"></i>
                    <span>Massage thư giãn</span>
                  </div>
                  <div className="flex items-center">
                    <i className="fa-solid fa-check text-[var(--primary-color)] mr-2"></i>
                    <span>Tư vấn chăm sóc da tại nhà</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Đánh giá từ khách hàng */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Đánh giá từ khách hàng</h2>

            {specialist.reviews && specialist.reviews.length > 0 ? (
              specialist.reviews.map((review, index) => (
                <div
                  key={index}
                  className="border-b pb-4 mb-4 last:border-0 last:mb-0 last:pb-0"
                >
                  <div className="flex items-center mb-2">
                    <div className="font-semibold">{review.customerName}</div>
                    <div className="mx-2">•</div>
                    <div className="text-yellow-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <i
                          key={i}
                          className={`fa-${
                            i < review.rating ? "solid" : "regular"
                          } fa-star`}
                        ></i>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))
            ) : (
              <>
                <div className="border-b pb-4 mb-4">
                  <div className="flex items-center mb-2">
                    <div className="font-semibold">Nguyễn Thị Minh</div>
                    <div className="mx-2">•</div>
                    <div className="text-yellow-500">
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                    </div>
                  </div>
                  <p className="text-gray-700">
                    Tôi rất hài lòng với dịch vụ của chuyên gia. Làn da của tôi
                    đã được cải thiện rõ rệt sau khi điều trị.
                  </p>
                </div>

                <div className="border-b pb-4 mb-4">
                  <div className="flex items-center mb-2">
                    <div className="font-semibold">Trần Văn Hoàng</div>
                    <div className="mx-2">•</div>
                    <div className="text-yellow-500">
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-regular fa-star"></i>
                    </div>
                  </div>
                  <p className="text-gray-700">
                    Chuyên gia rất tận tình và chuyên nghiệp. Tôi đã được tư vấn
                    chi tiết về cách chăm sóc da phù hợp với làn da của mình.
                  </p>
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <div className="font-semibold">Lê Thị Thu Hương</div>
                    <div className="mx-2">•</div>
                    <div className="text-yellow-500">
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                      <i className="fa-solid fa-star"></i>
                    </div>
                  </div>
                  <p className="text-gray-700">
                    Dịch vụ tuyệt vời! Chuyên gia có kiến thức sâu rộng về chăm
                    sóc da và luôn đưa ra những lời khuyên hữu ích.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SpecialistDetail;
