import React from "react";
import CardService from "../../../components/Card/CardService";
import Filter from "../../../components/Filter";
import Pagination from "../../../components/Pagination";

// Loading spinner component
export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary-color)]"></div>
    </div>
  );
}

// Error message component
export function ErrorMessage({ error }) {
  return (
    <div className="text-center py-10 text-red-500">
      <p>{error}</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 px-4 py-2 bg-[var(--primary-color)] text-white rounded"
      >
        Thử lại
      </button>
    </div>
  );
}

// Empty results component
export function EmptyResults() {
  return (
    <div className="text-center py-10 mb-20 text-gray-500 font-semibold">
      <p>Không tìm thấy dịch vụ nào phù hợp.</p>
    </div>
  );
}

// Service filter component
export function ServiceFilter({ 
  categoryNames, 
  onCategoryChange, 
  onSearchChange, 
  selectedCategory, 
  loading 
}) {
  return (
    <Filter
      serviceType={categoryNames}
      title="Dịch vụ"
      desc="Khám phá các dịch vụ chăm sóc da và làm đẹp"
      onCategoryChange={onCategoryChange}
      onSearchChange={onSearchChange}
      selectedCategory={selectedCategory}
      loading={loading}
    />
  );
}

// Service list component với loading state
export function ServiceList({ services, loading = false }) {
  if (loading) {
    // Hiển thị skeleton cards khi đang tải
    return (
      <div className={`flex justify-between flex-wrap my-10 gap-6`}>
        {[1, 2, 3].map((item) => (
          <div key={`skeleton-${item}`} className="w-[470px] h-[460px] rounded-[10px] overflow-hidden bg-white border border-black/10">
            <div className="h-[245px] bg-gray-200 animate-pulse"></div>
            <div className="p-6">
              <div className="h-6 bg-gray-200 animate-pulse rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 animate-pulse rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 animate-pulse rounded w-full mb-2"></div>
              <div className="h-10 bg-gray-200 animate-pulse rounded w-full mt-8"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`flex ${services.length > 2 ? "justify-between" : "justify-start"} flex-wrap my-10 gap-6`}>
      {services.map((service) => (
        <CardService key={service.id} service={service} />
      ))}
    </div>
  );
}

// Service content component that combines filter, list and pagination
export function ServiceContent({ 
  categoryNames, 
  currentItems, 
  filteredServices, 
  currentPage, 
  pageSize,
  selectedCategory,
  loading,
  paginationLoading,
  onCategoryChange, 
  onSearchChange, 
  onPageChange 
}) {
  return (
    <div>
      <ServiceFilter 
        categoryNames={categoryNames}
        onCategoryChange={onCategoryChange}
        onSearchChange={onSearchChange}
        selectedCategory={selectedCategory}
        loading={loading}
      />
      
      {currentItems.length === 0 && !paginationLoading ? (
        <EmptyResults />
      ) : (
        <div>
          <ServiceList services={currentItems} loading={paginationLoading} />
          <Pagination
            currentPage={currentPage}
            totalItems={filteredServices.length}
            pageSize={pageSize}
            onPageChange={onPageChange}
            loading={paginationLoading}
          />
        </div>
      )}
    </div>
  );
} 