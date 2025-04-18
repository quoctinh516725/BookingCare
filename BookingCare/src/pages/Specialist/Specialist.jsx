import { Fragment, useEffect, useState } from "react";
import Filter from "../../components/Filter";
import CardSpecialist from "../../components/Card/CardSpecialist";
import Pagination from "../../components/Pagination";
import useSpecialistData from "./hooks/useSpecialistData";

function Specialist() {
  const {
    currentItems,
    specialtyNames,
    loading,
    specialtyLoading,
    error,
    paginationLoading,
    filteredSpecialists,
    currentPage,
    pageSize,
    handleFilterChange,
    handleSearchChange,
    handlePageChange,
    handlePaginationHover
  } = useSpecialistData();

  // State for progressive loading of UI elements
  const [showMainContent, setShowMainContent] = useState(false);

  // Prioritize showing the main content quickly
  useEffect(() => {
    // Show the main content immediately
    setShowMainContent(true);
  }, []);

  return (
    <div className="flex flex-col mt-[100px]">
      <div className="container mx-auto">
        <div>
          {/* Always render Filter for better LCP */}
          <Filter
            serviceType={specialtyNames}
            title="Đội Ngũ Chuyên Viên"
            desc="Gặp gỡ đội ngũ chuyên viên giàu kinh nghiệm của chúng tôi, những người sẽ chăm sóc làn da của bạn"
            onCategoryChange={handleFilterChange}
            onSearchChange={handleSearchChange}
            loading={specialtyLoading}
            selectedCategory={specialtyNames[0] || "Tất cả"} 
          />

          {error ? (
            <div className="text-center py-10 text-red-500">
              <p>{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-[var(--primary-color)] text-white rounded"
              >
                Thử lại
              </button>
            </div>
          ) : !showMainContent ? (
            /* Minimal loading placeholder that doesn't block rendering */
            <div className="h-[500px]"></div>
          ) : filteredSpecialists.length === 0 && !loading ? (
            <div className="text-center py-10 mb-20 text-gray-500 font-semibold">
              <p>Không tìm thấy chuyên viên nào phù hợp.</p>
            </div>
          ) : (
            <div>
              <div
                className={`flex ${
                  currentItems.length > 2 ? "justify-between" : "justify-start"
                } flex-wrap my-10 gap-6 min-h-[600px]`}
              >
                {/* Show loading placeholders if loading or show actual items */}
                {loading || paginationLoading ? (
                  /* Static placeholders instead of animated ones */
                  Array(3).fill(0).map((_, i) => (
                    <div 
                      key={i} 
                      className="w-[470px] h-[500px] bg-gray-200 rounded-[10px]"
                      style={{ contentVisibility: 'auto' }}
                    />
                  ))
                ) : (
                  currentItems.map((specialist) => (
                    <CardSpecialist
                      key={specialist.id}
                      specialist={specialist}
                    />
                  ))
                )}
              </div>
              
              {/* Only render pagination when needed */}
              {!loading && filteredSpecialists.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalItems={filteredSpecialists.length}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                  onHover={handlePaginationHover}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Specialist;
