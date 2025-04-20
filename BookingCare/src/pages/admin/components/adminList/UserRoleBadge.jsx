import React, { useMemo } from "react";

const UserRoleBadge = ({ role }) => {
  const roleClasses = useMemo(() => {
    switch (role?.toUpperCase()) {
      case "ADMIN":
        return "bg-purple-100 text-purple-800";
      case "MANAGER":
        return "bg-blue-100 text-blue-800";
      case "STAFF":
        return "bg-green-100 text-green-800";
      case "EDITOR":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }, [role]);

  const roleText = useMemo(() => {
    switch (role?.toUpperCase()) {
      case "ADMIN":
        return "Quản trị viên";
      case "MANAGER":
        return "Quản lý";
      case "STAFF":
        return "Nhân viên";
      case "EDITOR":
        return "Biên tập viên";
      default:
        return role || "Không có";
    }
  }, [role]);

  return (
    <span
      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${roleClasses}`}
    >
      {roleText}
    </span>
  );
};

export default React.memo(UserRoleBadge); 