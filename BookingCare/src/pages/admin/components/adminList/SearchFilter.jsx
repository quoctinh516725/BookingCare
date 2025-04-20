import React from "react";
import PropTypes from "prop-types";

const SearchFilter = ({ 
  searchTerm, 
  setSearchTerm, 
  placeholder, 
  className,
  filters,
  selectedFilter,
  setSelectedFilter 
}) => {
  return (
    <div className={`flex gap-2 mb-4 ${className || ""}`}>
      <div className="relative flex-grow">
        <input
          type="text"
          className="w-full p-2 pl-8 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-pink-400"
          placeholder={placeholder || "Tìm kiếm..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      
      {filters && filters.length > 0 && (
        <select
          className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-pink-400"
          value={selectedFilter || ""}
          onChange={(e) => setSelectedFilter(e.target.value)}
        >
          {filters.map((filter) => (
            <option key={filter.value} value={filter.value}>
              {filter.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

SearchFilter.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    })
  ),
  selectedFilter: PropTypes.string,
  setSelectedFilter: PropTypes.func
};

export default React.memo(SearchFilter); 