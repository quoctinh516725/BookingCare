import React from "react";
import PropTypes from "prop-types";

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  className
}) => {
  const generatePageNumbers = () => {
    const pageNumbers = [];
    
    // Always show first page
    pageNumbers.push(1);
    
    // Calculate range around current page
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);
    
    // Add ellipsis after first page if needed
    if (startPage > 2) {
      pageNumbers.push("...");
    }
    
    // Add pages around current page
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      pageNumbers.push("...");
    }
    
    // Add last page if there is more than one page
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  if (totalPages <= 1) return null;

  return (
    <div className={`flex justify-center mt-5 ${className || ""}`}>
      <button
        className="px-3 py-1 mx-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        &laquo;
      </button>
      
      {generatePageNumbers().map((page, index) => (
        <button
          key={`${page}-${index}`}
          onClick={() => typeof page === "number" ? onPageChange(page) : null}
          className={`px-3 py-1 mx-1 border rounded ${
            page === currentPage
              ? "bg-pink-500 text-white"
              : page === "..."
              ? "cursor-default"
              : "hover:bg-gray-100"
          }`}
          disabled={page === "..."}
        >
          {page}
        </button>
      ))}
      
      <button
        className="px-3 py-1 mx-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        &raquo;
      </button>
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  className: PropTypes.string
};

export default React.memo(Pagination); 