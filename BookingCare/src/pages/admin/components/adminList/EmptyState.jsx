import React from "react";

const EmptyState = ({ message, buttonText, buttonAction }) => {
  return (
    <div className="text-center py-8 bg-white">
      <div className="p-6">
        <i className="fas fa-users-slash text-gray-300 text-5xl mb-4"></i>
        <p className="text-gray-500 mb-3">{message || "Không tìm thấy dữ liệu"}</p>
        {buttonText && buttonAction && (
          <button
            onClick={buttonAction}
            className="mt-2 text-pink-500 hover:text-pink-600 underline"
          >
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
};

export default React.memo(EmptyState); 