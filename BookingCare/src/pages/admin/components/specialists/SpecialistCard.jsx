import React from "react";
import PropTypes from "prop-types";
import { useImageCache } from "../../../../hooks/useImageCache";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

const SpecialistCard = ({ 
  specialist, 
  onView, 
  onEdit, 
  onDelete,
  selected = false
}) => {
  const { getCachedImageUrl } = useImageCache();
  
  if (!specialist) return null;
  
  const {
    id,
    firstName,
    lastName,
    profileImage,
    specialistCategory,
    position,
    yearsOfExperience,
  } = specialist;
  
  const handleView = () => {
    if (onView) onView(specialist);
  };
  
  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit) onEdit(specialist);
  };
  
  const handleDelete = (e) => {
    e.stopPropagation();
    if (onDelete) onDelete(specialist);
  };
  
  return (
    <div 
      data-specialist-id={id}
      className={`relative bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer ${
        selected ? "ring-2 ring-pink-500" : ""
      }`}
      onClick={handleView}
    >
      <div className="relative pb-[60%] overflow-hidden bg-gray-100">
        {profileImage ? (
          <img 
            src={getCachedImageUrl(profileImage)} 
            alt={`${firstName} ${lastName}`}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/default-specialist.jpg';
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 truncate">
          {firstName} {lastName}
        </h3>
        
        <p className="text-sm text-gray-500 mb-2">
          {specialistCategory?.name || "Uncategorized"}
        </p>
        
        <p className="text-sm text-gray-700 mb-1">
          {position || "Specialist"}
        </p>
        
        {yearsOfExperience && (
          <p className="text-xs text-gray-600">
            {yearsOfExperience} {yearsOfExperience === 1 ? "year" : "years"} of experience
          </p>
        )}
      </div>
      
      <div className="absolute bottom-0 right-0 p-2 flex gap-2">
        <button
          onClick={handleEdit}
          className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
          aria-label="Edit specialist"
        >
          <FaEdit size={16} />
        </button>
        
        <button
          onClick={handleDelete}
          className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors"
          aria-label="Delete specialist"
        >
          <FaTrash size={16} />
        </button>
      </div>
    </div>
  );
};

SpecialistCard.propTypes = {
  specialist: PropTypes.shape({
    id: PropTypes.string.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    profileImage: PropTypes.string,
    specialistCategory: PropTypes.shape({
      name: PropTypes.string
    }),
    position: PropTypes.string,
    yearsOfExperience: PropTypes.number
  }).isRequired,
  onView: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  selected: PropTypes.bool
};

export default SpecialistCard; 