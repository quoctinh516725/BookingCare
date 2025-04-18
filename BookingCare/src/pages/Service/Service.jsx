import React from "react";
import useServiceData from "./hooks/useServiceData";
import { 
  LoadingSpinner, 
  ErrorMessage, 
  ServiceContent 
} from "./components/ServiceComponents";

function Service() {
  const {
    categoryNames,
    selectedCategory,
    loading,
    categoryLoading,
    error,
    currentItems,
    filteredServices,
    currentPage,
    pageSize,
    handleFilterChange,
    handleSearchChange,
    handlePageChange
  } = useServiceData();

  return (
    <div className="flex flex-col mt-[100px]">
      <div className="container mx-auto">
        <div>
          {loading || categoryLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorMessage error={error} />
          ) : (
            <ServiceContent
              categoryNames={categoryNames}
              currentItems={currentItems}
              filteredServices={filteredServices}
              currentPage={currentPage}
              pageSize={pageSize}
              selectedCategory={selectedCategory}
              loading={loading}
              onCategoryChange={handleFilterChange}
              onSearchChange={handleSearchChange}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Service;
