import React from "react";
import { Link } from "react-router-dom";

// Loading skeleton for service detail
export function DetailSkeleton() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-1/3 mb-5"></div>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2 h-[400px] bg-gray-200 rounded-lg"></div>
          <div className="w-full md:w-1/2">
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

// Error message component
export function ErrorMessage({ error }) {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">
          Đã xảy ra lỗi
        </h2>
        <p className="mb-4">{error}</p>
        <Link
          to="/service"
          className="text-[var(--primary-color)] font-semibold flex items-center"
        >
          Quay lại danh sách dịch vụ
        </Link>
      </div>
    </div>
  );
}

// Not found component
export function NotFound() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Không tìm thấy dịch vụ</h2>
        <Link
          to="/service"
          className="text-[var(--primary-color)] font-semibold flex items-center"
        >
          Quay lại danh sách dịch vụ
        </Link>
      </div>
    </div>
  );
}

// Back link component
export function BackToServices() {
  return (
    <div className="mb-6">
      <Link
        to="/service"
        className="text-[var(--primary-color)] font-semibold"
      >
        <i className="fa fa-arrow-left mr-2"></i> Quay lại danh sách dịch vụ
      </Link>
    </div>
  );
}

// Service image component
export function ServiceImage({ image, name }) {
  return (
    <div className="w-full md:w-1/2">
      <img
        src={
          image ||
          "https://via.placeholder.com/600x400?text=Dịch+vụ+chăm+sóc+da"
        }
        alt={name}
        className="w-full h-auto rounded-lg shadow-md object-cover"
      />
    </div>
  );
}

// Service information component
export function ServiceInfo({ service }) {
  const formattedPrice =
    new Intl.NumberFormat("vi-VN").format(service.price) + " ₫";

  return (
    <div className="w-full md:w-1/2">
      <h1 className="text-3xl font-bold mb-4">{service.name}</h1>

      <div className="flex items-center space-x-4 mb-6">
        <div className="bg-[var(--primary-color)] text-white px-4 py-2 rounded-md">
          {formattedPrice}
        </div>
        <div className="flex items-center text-gray-600">
          <i className="fa-regular fa-clock mr-2"></i>
          <span>{service.duration} phút</span>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Mô tả</h2>
        <p className="text-gray-700 mb-4">{service.description}</p>

        <h2 className="text-xl font-semibold mb-2">Lợi ích</h2>
        <ul className="list-disc pl-5 mb-4">
          {service.benefits ? (
            service.benefits.map((benefit, index) => (
              <li key={index} className="text-gray-700 mb-1">
                {benefit}
              </li>
            ))
          ) : (
            <>
              <li className="text-gray-700 mb-1">
                Làm sạch sâu lỗ chân lông
              </li>
              <li className="text-gray-700 mb-1">
                Cải thiện độ đàn hồi của da
              </li>
              <li className="text-gray-700 mb-1">Phục hồi độ ẩm cho da</li>
            </>
          )}
        </ul>

        <h2 className="text-xl font-semibold mb-2">Đối tượng phù hợp</h2>
        <p className="text-gray-700">
          {service.suitableFor ||
            "Phù hợp với mọi loại da, đặc biệt là da khô và da nhạy cảm"}
        </p>
      </div>

      <Link to={`/booking?service=${service.id}`}>
        <button className="w-full py-3 text-white font-semibold text-lg rounded-md bg-[var(--primary-color)] transition duration-300">
          Đặt lịch ngay
        </button>
      </Link>
    </div>
  );
}

// Service process component
export function ServiceProcess({ process }) {
  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Quy trình thực hiện</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {process ? (
          process.map((step, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-[var(--primary-color)] rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
                {index + 1}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-700">{step.description}</p>
            </div>
          ))
        ) : (
          <>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-[var(--primary-color)] rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Làm sạch</h3>
              <p className="text-gray-700">
                Làm sạch da mặt với sản phẩm phù hợp với loại da của bạn
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-[var(--primary-color)] rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Tẩy tế bào chết</h3>
              <p className="text-gray-700">
                Loại bỏ tế bào chết, giúp da sáng mịn và hấp thụ dưỡng chất
                tốt hơn
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-[var(--primary-color)] rounded-full flex items-center justify-center text-white font-bold text-xl mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Dưỡng ẩm</h3>
              <p className="text-gray-700">
                Phục hồi độ ẩm và dưỡng chất thiết yếu cho da
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
} 