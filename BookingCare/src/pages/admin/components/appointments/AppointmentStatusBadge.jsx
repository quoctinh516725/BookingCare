import React, { useMemo } from "react";

const AppointmentStatusBadge = ({ status }) => {
  const statusClasses = useMemo(() => {
    switch (status) {
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }, [status]);

  const statusText = useMemo(() => {
    switch (status) {
      case "PENDING":
        return "Chờ xác nhận";
      case "CONFIRMED":
        return "Đã xác nhận";
      case "COMPLETED":
        return "Hoàn thành";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status;
    }
  }, [status]);

  return (
    <span
      className={`min-w-[100px] flex justify-center px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses}`}
    >
      {statusText}
    </span>
  );
};

export default React.memo(AppointmentStatusBadge); 