import React, { useMemo } from "react";

const SpecialistStatusBadge = ({ status }) => {
  const statusClasses = useMemo(() => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "INACTIVE":
        return "bg-gray-100 text-gray-800";
      case "ON_LEAVE":
        return "bg-yellow-100 text-yellow-800";
      case "TERMINATED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }, [status]);

  const statusText = useMemo(() => {
    switch (status) {
      case "ACTIVE":
        return "Đang hoạt động";
      case "INACTIVE":
        return "Tạm ngưng";
      case "ON_LEAVE":
        return "Đang nghỉ";
      case "TERMINATED":
        return "Đã chấm dứt";
      default:
        return status;
    }
  }, [status]);

  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses}`}
    >
      {statusText}
    </span>
  );
};

export default React.memo(SpecialistStatusBadge); 