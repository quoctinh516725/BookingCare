import React from "react";
import { Link } from "react-router-dom";
import Background from "../../../assets/home/BackgroundHome.avif";
import testImg from "../../../assets/home/testImg.webp";
import CardService from "../../../components/Card/CardService";
import CardSpecialist from "../../../components/Card/CardSpecialist";
import CardBlog from "../../../components/Card/CardBlog";

// Component hiển thị skeleton khi đang tải
export function SkeletonCard() {
  return (
    <div className="w-[470px] rounded-[10px] overflow-hidden bg-white border border-black/10 animate-pulse">
      <div className="w-full h-[245px] bg-gray-200"></div>
      <div className="p-6">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="flex justify-between items-center mb-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
        <div className="h-16 bg-gray-200 rounded w-full mb-4"></div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>
    </div>
  );
}

// Component hiển thị thông báo lỗi
export function ErrorMessage({ message }) {
  return (
    <div className="w-full p-4 bg-red-50 text-red-600 rounded-lg text-center my-4">
      <p>{message}</p>
      <button 
        className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        onClick={() => window.location.reload()}
      >
        Thử lại
      </button>
    </div>
  );
}

// Component phần Hero
export function HeroSection() {
  return (
    <div className="w-full h-[600px] relative">
      <img
        src={Background}
        alt="Background"
        className="w-full h-full bg-cover object-cover"
      />
      <div className="w-full h-full absolute left-0 top-0 bg-black/55"></div>
      <div className="absolute max-w-[850px] top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] text-white">
        <h1 className="text-6xl font-bold font-arial whitespace-nowrap">
          Chăm Sóc Da Chuyên Nghiệp
        </h1>
        <p className="text-3xl mt-5">
          Khám phá các dịch vụ chăm sóc da cao cấp và được tư vấn bởi các
          chuyên gia hàng đầu
        </p>
        <Link to="/booking">
          <button className="mt-5">
            <i className="fa-solid fa-calendar-days"></i>{" "}
            <span>Đặt lịch ngay</span>
          </button>
        </Link>
      </div>
    </div>
  );
}

// Component phần Dịch vụ
export function ServicesSection({ services, loading, error }) {
  return (
    <div className="container mx-auto mt-15">
      <div className="text-center">
        <h2 className="text-4xl font-bold uppercase">
          Dịch Vụ Của Chúng Tôi
        </h2>
        <p className="m-4 mb-10 text-xl text-[#565F6C]">
          Khám phá các dịch vụ chăm sóc da chuyên nghiệp
        </p>
      </div>
      
      {error && <ErrorMessage message={error} />}
      
      <div className="flex justify-between flex-wrap gap-4">
        {loading ? (
          // Hiển thị skeleton khi đang tải
          Array(3).fill(0).map((_, index) => (
            <SkeletonCard key={`service-skeleton-${index}`} />
          ))
        ) : services.length > 0 ? (
          // Hiển thị dữ liệu dịch vụ
          services.map((service) => (
            <CardService key={service.id} service={service} />
          ))
        ) : !error && (
          // Hiển thị thông báo nếu không có dữ liệu
          <div className="w-full text-center py-8">
            <p className="text-gray-500">Không có dịch vụ nào</p>
          </div>
        )}
      </div>
      <div className="flex justify-center m-10">
        <Link to="/service">
          <button className="p-4">Xem tất cả dịch vụ</button>
        </Link>
      </div>
    </div>
  );
}

// Component phần Chuyên viên
export function SpecialistsSection({ specialists, loading, error }) {
  return (
    <div className="container mx-auto my-10">
      <div className="text-center">
        <h2 className="text-4xl font-bold uppercase">
          Đội Ngũ Chuyên Viên
        </h2>
        <p className="m-4 mb-10 text-xl text-[#565F6C]">
          Đội ngũ chuyên viên giàu kinh nghiệm của chúng tôi luôn sẵn sàng
          tư vấn và chăm sóc làn da của bạn với những dịch vụ chất lượng cao
        </p>
      </div>
      
      {error && <ErrorMessage message={error} />}
      
      <div className="flex justify-between flex-wrap gap-4">
        {loading ? (
          // Hiển thị skeleton khi đang tải
          Array(3).fill(0).map((_, index) => (
            <SkeletonCard key={`specialist-skeleton-${index}`} />
          ))
        ) : specialists.length > 0 ? (
          // Hiển thị dữ liệu chuyên viên
          specialists.map((specialist) => (
            <CardSpecialist key={specialist.id} specialist={specialist} />
          ))
        ) : !error && (
          // Hiển thị thông báo nếu không có dữ liệu
          <div className="w-full text-center py-8">
            <p className="text-gray-500">Không có chuyên viên nào</p>
          </div>
        )}
      </div>
      <div className="flex justify-center m-10">
        <Link to="/specialist">
          <button className="p-4">Xem tất cả chuyên viên</button>
        </Link>
      </div>
    </div>
  );
}

// Component phần Trắc nghiệm da
export function SkinTestSection() {
  return (
    <div className="my-10">
      <div className=" bg-[#fde9f3]">
        <div className="container mx-auto flex py-20">
          <div className="w-[50%] py-10 pr-20">
            <h2 className="text-4xl font-bold uppercase">
              Khám phá loại da của bạn
            </h2>
            <p className="my-10 text-xl">
              Sử dụng công cụ trắc nghiệm da miễn phí của chúng tôi để nhận
              diện chính xác loại da và nhận được gợi ý về các dịch vụ và
              sản phẩm phù hợp nhất.
            </p>
            <div className="flex text-xl items-center space-x-4 my-5">
              <i className="fa-regular fa-circle-check text-3xl text-[var(--primary-color)]"></i>{" "}
              <span> Xác định chính xác loại da của bạn</span>
            </div>
            <div className="flex text-xl items-center space-x-4 my-5">
              <i className="fa-regular fa-circle-check text-3xl  text-[var(--primary-color)]"></i>{" "}
              <span> Nhận gợi ý dịch vụ phù hợp</span>
            </div>
            <div className="flex text-xl items-center space-x-4 my-5">
              <i className="fa-regular fa-circle-check text-3xl  text-[var(--primary-color)]"></i>{" "}
              <span>Tư vấn sản phẩm chăm sóc cá nhân hóa</span>
            </div>
            <div className="flex text-xl items-center space-x-4 my-5">
              <i className="fa-regular fa-circle-check text-3xl  text-[var(--primary-color)]"></i>{" "}
              <span> Hoàn toàn miễn phí, chỉ mất 2 phút</span>
            </div>
            <Link to="/test">
              <button className="mt-10">Làm trắc nghiệm miễn phí</button>
            </Link>
          </div>
          <div className="w-[50%]">
            <div className="overflow-hidden rounded-2xl">
              <img
                className="hover:scale-110 transition-transform duration-500 ease-in-out"
                src={testImg}
                alt=""
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Component phần Blog
export function BlogsSection({ blogs, loading, error }) {
  return (
    <div className="container mx-auto my-10">
      <div className="text-center">
        <h2 className="text-4xl font-bold uppercase">Bài Viết Nổi Bật</h2>
        <p className="m-4 mb-10 text-xl text-[#565F6C]">
          Chia sẻ kiến thức và bí quyết chăm sóc da từ các chuyên gia hàng
          đầu
        </p>
      </div>
      
      {error && <ErrorMessage message={error} />}
      
      <div className="flex justify-between flex-wrap gap-4">
        {loading ? (
          // Hiển thị skeleton khi đang tải
          Array(3).fill(0).map((_, index) => (
            <SkeletonCard key={`blog-skeleton-${index}`} />
          ))
        ) : blogs.length > 0 ? (
          // Hiển thị dữ liệu blog
          blogs.map((blog) => (
            <CardBlog key={blog.id} blog={blog} />
          ))
        ) : !error && (
          // Hiển thị thông báo nếu không có dữ liệu
          <div className="w-full text-center py-8">
            <p className="text-gray-500">Không có bài viết nào</p>
          </div>
        )}
      </div>
      <div className="flex justify-center m-10">
        <Link to="/blog">
          <button className="p-4">Xem tất cả bài viết</button>
        </Link>
      </div>
    </div>
  );
} 