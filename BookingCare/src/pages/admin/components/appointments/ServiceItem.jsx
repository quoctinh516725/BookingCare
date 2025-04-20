import React from "react";

const ServiceItem = ({ service }) => (
  <div className="flex items-start p-3 bg-gray-50 rounded-md">
    {service.image && (
      <img
        src={service.image}
        alt={service.name}
        className="w-12 h-12 object-cover rounded-md mr-3"
        loading="lazy"
      />
    )}
    <div>
      <p className="font-medium text-gray-900">{service.name}</p>
      <div className="flex items-center text-sm text-gray-500 mt-1">
        <span className="mr-3">
          {new Intl.NumberFormat("vi-VN").format(service.price)}₫
        </span>
        <span>{service.duration} phút</span>
      </div>
    </div>
  </div>
);

export default React.memo(ServiceItem); 