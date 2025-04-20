import React, { useMemo } from "react";

const UserStatusBadge = ({ isActive }) => {
  const statusClasses = useMemo(() => {
    return isActive
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  }, [isActive]);

  const statusText = useMemo(() => {
    return isActive ? "Đang hoạt động" : "Đã vô hiệu";
  }, [isActive]);

  return (
    <span
      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses}`}
    >
      {statusText}
    </span>
  );
};

export default React.memo(UserStatusBadge); 