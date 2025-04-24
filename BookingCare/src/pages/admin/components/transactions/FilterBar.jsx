import React, { memo } from 'react';

const FilterBar = memo(({
  searchQuery,
  filterStatus,
  filterPaymentStatus,
  onSearch,
  onFilterChange,
  onToggleView,
  showAllBookings
}) => {
  return (
    <div className="mb-4 bg-white p-3 rounded shadow">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Tìm theo ID, tên khách hàng hoặc số điện thoại"
            value={searchQuery}
            onChange={onSearch}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
          />
        </div>

        <div>
          <select
            value={filterStatus}
            onChange={(e) => onFilterChange("status", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="PENDING">Chờ xác nhận</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
        </div>

        <div>
          <select
            value={filterPaymentStatus}
            onChange={(e) => onFilterChange("paymentStatus", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
          >
            <option value="all">Tất cả TT thanh toán</option>
            <option value="UNPAID">Chưa thanh toán</option>
            <option value="COMPLETED">Đã thanh toán</option>
            <option value="REFUNDED">Đã hoàn tiền</option>
          </select>
        </div>

        <div>
          <span
            onClick={onToggleView}
            className="px-3 py-2 rounded-md bg-[var(--primary-color)] text-white cursor-pointer"
          >
            {showAllBookings ? "Xem gần đây" : "Xem tất cả"}
          </span>
        </div>
      </div>
    </div>
  );
});

FilterBar.displayName = 'FilterBar';

export default FilterBar; 