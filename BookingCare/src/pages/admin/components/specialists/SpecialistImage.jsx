import React from "react";
import useImageCache from "../../hooks/useImageCache";

const SpecialistImage = ({ src, alt, className = "h-full w-full object-cover", rounded = true }) => {
  const { imgSrc, isLoading } = useImageCache(
    src, 
    '', // Empty prefix
    0.8, // Quality
    7 * 24 * 60 * 60 * 1000, // Cache for 7 days
    'specialist_img_' // Cache key prefix
  );
  
  const baseClasses = `${className} ${rounded ? 'rounded-full' : ''}`;
  
  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100">
        <div className="w-5 h-5 border-2 border-gray-200 border-t-pink-500 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!imgSrc) {
    return (
      <div className="h-full w-full flex items-center justify-center text-gray-400">
        <i className="fas fa-user text-2xl"></i>
      </div>
    );
  }
  
  return (
    <img
      src={imgSrc}
      alt={alt}
      className={baseClasses}
      loading="lazy"
      decoding="async"
      fetchPriority="low"
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = "/default-image.png";
      }}
    />
  );
};

export default React.memo(SpecialistImage); 