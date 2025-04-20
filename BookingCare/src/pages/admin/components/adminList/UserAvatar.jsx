import React from "react";
import useImageCache from "../../hooks/useImageCache";

const UserAvatar = ({ src, alt, className = "h-10 w-10", size = "md" }) => {
  const { imgSrc, isLoading } = useImageCache(
    src, 
    '', // Empty prefix
    0.8, // Quality
    7 * 24 * 60 * 60 * 1000, // Cache for 7 days
    'admin_avatar_' // Cache key prefix
  );
  
  // Size classes map
  const sizeClasses = {
    'sm': 'h-8 w-8 text-xs',
    'md': 'h-10 w-10 text-sm',
    'lg': 'h-12 w-12 text-base',
    'xl': 'h-16 w-16 text-lg'
  };
  
  const baseClasses = `${className} ${sizeClasses[size] || sizeClasses.md} rounded-full object-cover`;
  
  // Generate a color based on the name
  const generateColor = (name) => {
    if (!name) return 'bg-gray-200';
    
    // Simple hash function to get deterministic color
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // List of background colors
    const colors = [
      'bg-blue-200', 'bg-red-200', 'bg-green-200', 
      'bg-yellow-200', 'bg-purple-200', 'bg-pink-200', 
      'bg-indigo-200', 'bg-teal-200'
    ];
    
    return colors[Math.abs(hash) % colors.length];
  };
  
  // Get initials from name
  const getInitials = (name) => {
    if (!name) return '';
    return name.split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  if (isLoading) {
    return (
      <div className={`${baseClasses} bg-gray-100 flex items-center justify-center animate-pulse`}></div>
    );
  }
  
  if (!imgSrc) {
    const avatarColor = generateColor(alt);
    return (
      <div className={`${baseClasses} ${avatarColor} flex items-center justify-center`}>
        <span className="font-medium text-gray-700">{getInitials(alt)}</span>
      </div>
    );
  }
  
  return (
    <img
      src={imgSrc}
      alt={alt}
      className={baseClasses}
      loading="lazy"
      fetchPriority="low"
      onError={(e) => {
        e.target.onerror = null;
        // Falls back to initials
        e.target.style.display = 'none';
        // You can create a fallback element here if needed
      }}
    />
  );
};

export default React.memo(UserAvatar); 