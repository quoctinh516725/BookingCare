import React, { memo } from "react";
import useBookingsData from "./hooks/useBookingsData";
import Loader from "./components/transactions/Loader";
import FilterBar from "./components/transactions/FilterBar";
import BookingTable from "./components/transactions/BookingTable";
import VerificationModal from "./components/transactions/VerificationModal";
import AdminPaymentQRCode from "./components/transactions/AdminPaymentQRCode";

/**
 * Component chính quản lý giao dịch, được tối ưu với:
 * - Tách biệt logic (custom hook) và UI (components) 
 * - Sử dụng memo để tránh re-render không cần thiết
 * - Cấu trúc component rõ ràng để dễ bảo trì
 */
const Transactions = memo(() => {
  // Sử dụng custom hook để quản lý tất cả logic và state
  const {
    // Data
    paginatedBookings,
    totalItems,
    paymentStatuses,
    currentBooking,
    
    // Loading state
    isLoading,
    paymentLoading,
    error,
    
    // Filter state
    searchQuery,
    filterStatus,
    filterPaymentStatus,
    showAllBookings,
    
    // Pagination state
    currentPage,
    pageSize,
    
    // Modal state
    showVerificationModal,
    verificationCode,
    verificationError,
    verifyingPayment,
    showQRModal,
    currentBookingId,
    
    // Actions
    fetchBookings,
    openVerificationModal,
    closeVerificationModal,
    handleVerificationSubmit,
    handleVerificationCodeChange,
    handleSearch,
    handleFilterChange,
    toggleBookingsView,
    handlePageChange,
    closeQRModal,
    handleViewQRFromVerification
  } = useBookingsData();

  return (
    <div className="transactions-container p-6">
      <h1 className="text-2xl font-bold mb-6">Quản lý giao dịch</h1>

      {/* Component Filter Bar */}
      <FilterBar
        searchQuery={searchQuery}
        filterStatus={filterStatus}
        filterPaymentStatus={filterPaymentStatus}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        onToggleView={toggleBookingsView}
        showAllBookings={showAllBookings}
      />

      {isLoading ? (
        <div className="loading-container bg-white p-10 rounded shadow flex justify-center">
          <Loader />
        </div>
      ) : error ? (
        <div className="error-message bg-red-50 p-6 rounded shadow text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <span
            onClick={fetchBookings}
            className="px-3 py-1 bg-[var(--primary-color)] text-white rounded hover:bg-[var(--primary-color)]/80 cursor-pointer"
          >
            Thử lại
          </span>
        </div>
      ) : (
        <div className="bookings-section bg-white p-4 rounded shadow">
          <h2 className="text-lg font-medium mb-4">
            Danh sách lịch hẹn {showAllBookings ? "" : "gần đây"}
          </h2>

          {/* Component BookingTable */}
          <BookingTable
            paginatedBookings={paginatedBookings}
            paymentStatuses={paymentStatuses}
            paymentLoading={paymentLoading}
            totalItems={totalItems}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onVerify={openVerificationModal}
          />
        </div>
      )}

      {/* Modals */}
      {showVerificationModal && (
        <VerificationModal
          currentBooking={currentBooking}
          verificationCode={verificationCode}
          verificationError={verificationError}
          verifyingPayment={verifyingPayment}
          onSubmit={handleVerificationSubmit}
          onCodeChange={handleVerificationCodeChange}
          onClose={closeVerificationModal}
          onViewQR={handleViewQRFromVerification}
        />
      )}
      
      {showQRModal && (
        <AdminPaymentQRCode
          bookingId={currentBookingId}
          onClose={closeQRModal}
        />
      )}
    </div>
  );
});

Transactions.displayName = 'Transactions';

export default Transactions;
