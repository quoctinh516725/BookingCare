import React from "react";
import PropTypes from "prop-types";
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import SpecialistImage from "./SpecialistImage";
import SpecialistStatusBadge from "./SpecialistStatusBadge";
import StarRating from "./StarRating";
import { useSpecialists } from "../../contexts/SpecialistContext";

const SpecialistCard = ({ 
  specialist, 
  onView, 
  onEdit, 
  onDelete,
  ImageComponent
}) => {
  const { deleteSpecialist } = useSpecialists();
  const { id, nameSpecialist, nameSpecialists, specialty, image } = specialist;
  
  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm("Bạn có chắc chắn muốn xóa chuyên viên này không?")) {
      try {
        await deleteSpecialist(id);
        if (onDelete) onDelete(id);
      } catch (error) {
        console.error("Failed to delete specialist:", error);
      }
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    if (onEdit) onEdit(specialist);
  };

  const handleView = () => {
    if (onView) onView(specialist);
  };

  const displayName = nameSpecialist || nameSpecialists || 'No Name';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md">
      <div className="relative h-48 bg-gray-100">
        {ImageComponent ? (
          <ImageComponent
            src={image}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={image || '/images/placeholder-specialist.jpg'}
            alt={displayName}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/placeholder-specialist.jpg';
            }}
          />
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg truncate" title={displayName}>
          {displayName}
        </h3>
        
        {specialty && (
          <p className="text-gray-600 text-sm mt-1 truncate" title={specialty}>
            {specialty}
          </p>
        )}
        
        <div className="flex justify-between mt-4">
          <button
            onClick={handleView}
            className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50"
            title="View details"
          >
            <FaEye />
          </button>

          <button
            onClick={handleEdit}
            className="text-amber-500 hover:text-amber-700 p-2 rounded-full hover:bg-amber-50"
            title="Edit specialist"
          >
            <FaEdit />
          </button>

          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50"
            title="Delete specialist"
          >
            <FaTrash />
          </button>
        </div>
      </div>
    </div>
  );
};

SpecialistCard.propTypes = {
  specialist: PropTypes.shape({
    id: PropTypes.string.isRequired,
    nameSpecialist: PropTypes.string,
    nameSpecialists: PropTypes.string,
    specialty: PropTypes.string,
    image: PropTypes.string
  }).isRequired,
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  ImageComponent: PropTypes.elementType
};

export default React.memo(SpecialistCard); 