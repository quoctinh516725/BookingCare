import React, { useState } from "react";
import PropTypes from "prop-types";
import SpecialistCard from "./SpecialistCard";
import SpecialistDetailModal from "./SpecialistDetailModal";
import SpecialistEditModal from "./SpecialistEditModal";

const SpecialistGrid = ({ 
  specialists, 
  loading, 
  onDeleteSpecialist, 
  onUpdateSpecialist,
  ImageComponent 
}) => {
  const [selectedSpecialist, setSelectedSpecialist] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const handleViewSpecialist = (specialist) => {
    setSelectedSpecialist(specialist);
    setViewModalOpen(true);
  };

  const handleEditSpecialist = (specialist) => {
    setSelectedSpecialist(specialist);
    setEditModalOpen(true);
  };

  const handleCloseModals = () => {
    setViewModalOpen(false);
    setEditModalOpen(false);
  };

  const handleSpecialistUpdated = (updatedSpecialist) => {
    if (onUpdateSpecialist) {
      onUpdateSpecialist(updatedSpecialist);
    }
    handleCloseModals();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!specialists || specialists.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No specialists found. Add a specialist to get started.
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {specialists.map((specialist) => (
          <SpecialistCard
            key={specialist.id}
            specialist={specialist}
            onView={handleViewSpecialist}
            onEdit={handleEditSpecialist}
            onDelete={onDeleteSpecialist}
            ImageComponent={ImageComponent}
          />
        ))}
      </div>

      {selectedSpecialist && viewModalOpen && (
        <SpecialistDetailModal
          specialist={selectedSpecialist}
          onClose={handleCloseModals}
          onEdit={() => {
            setViewModalOpen(false);
            setEditModalOpen(true);
          }}
        />
      )}

      {selectedSpecialist && editModalOpen && (
        <SpecialistEditModal
          specialist={selectedSpecialist}
          onClose={handleCloseModals}
          onSave={handleSpecialistUpdated}
        />
      )}
    </div>
  );
};

SpecialistGrid.propTypes = {
  specialists: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      nameSpecialist: PropTypes.string,
      nameSpecialists: PropTypes.string,
      specialty: PropTypes.string,
      image: PropTypes.string
    })
  ).isRequired,
  loading: PropTypes.bool,
  onDeleteSpecialist: PropTypes.func.isRequired,
  onUpdateSpecialist: PropTypes.func.isRequired,
  ImageComponent: PropTypes.elementType
};

SpecialistGrid.defaultProps = {
  loading: false
};

export default SpecialistGrid; 