import React from "react";

const UserListHeader = ({ title, buttonText, buttonAction }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h1 className="text-xl font-medium text-gray-800">{title || "Danh sách người dùng"}</h1>
      {buttonText && buttonAction && (
        <button
          onClick={buttonAction}
          className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition-colors"
        >
          {buttonText}
        </button>
      )}
    </div>
  );
};

export default React.memo(UserListHeader); 