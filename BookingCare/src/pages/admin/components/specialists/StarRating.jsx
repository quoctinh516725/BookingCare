import React from "react";

const StarRating = ({ rating, showValue = false }) => {
  if (!rating && rating !== 0) return null;

  return (
    <div className="flex items-center">
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <i
            key={i}
            className={`fas fa-star ${
              i <= rating ? "text-yellow-400" : "text-gray-300"
            }`}
          ></i>
        ))}
      </div>
      
      {showValue && (
        <span className="ml-1 text-sm text-gray-600">
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  );
};

export default React.memo(StarRating); 