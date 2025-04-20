import React, { useState } from "react";
import PropTypes from "prop-types";
import SpecialistCard from "./SpecialistCard";
import { Spinner } from "../../../../components";
import SpecialistDetailModal from "./SpecialistDetailModal";
import SpecialistEditModal from "./SpecialistEditModal";

const SpecialistGrid = ({
  specialists,
  isLoading,
  onEdit,
  onDelete,
  categories,
}) => {
  const [selectedSpecialist, setSelectedSpecialist] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleViewSpecialist = (specialist) => {
    setSelectedSpecialist(specialist);
    setShowDetailModal(true);
  };

  const handleEditSpecialist = (specialist) => {
    setSelectedSpecialist(specialist);
    setShowEditModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!specialists || specialists.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">No specialists found.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {specialists.map((specialist) => (
          <SpecialistCard
            key={specialist.id}
            specialist={specialist}
            onView={handleViewSpecialist}
            onEdit={handleEditSpecialist}
            onDelete={onDelete}
            selected={selectedSpecialist?.id === specialist.id}
          />
        ))}
      </div>

      {showDetailModal && selectedSpecialist && (
        <SpecialistDetailModal
          specialist={selectedSpecialist}
          isOpen={showDetailModal}
          onClose={handleCloseDetailModal}
        />
      )}

      {showEditModal && selectedSpecialist && (
        <SpecialistEditModal
          specialist={selectedSpecialist}
          categories={categories}
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          onSubmit={(data) => {
            onEdit(selectedSpecialist.id, data);
            setShowEditModal(false);
          }}
        />
      )}
    </div>
  );
};

SpecialistGrid.propTypes = {
  specialists: PropTypes.array.isRequired,
  isLoading: PropTypes.bool,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  categories: PropTypes.array,
};

SpecialistGrid.defaultProps = {
  isLoading: false,
  categories: [],
};

export default SpecialistGrid; 