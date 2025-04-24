import React, { memo } from 'react';
import { formatCurrency } from "../../../../utils/formatters";
import Pagination from "../../../../components/Pagination";

const formatDateTime = (bookingDate, startTime) => {
  if (!bookingDate) return "N/A";
  const date = new Date(bookingDate);
  const formattedDate = date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  if (!startTime) return formattedDate;
  return `${formattedDate} ${startTime}`;
};

const BookingTable = memo(({
  paginatedBookings,
  paymentStatuses,
  paymentLoading,
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onVerify
}) => {
  if (paginatedBookings.length === 0) {
    return (
      <p className="text-center py-4 text-gray-500">
        Không có lịch hẹn nào phù hợp
      </p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="bookings-table w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">Khách hàng</th>
              <th className="p-2 text-left">Thời gian</th>
              <th className="p-2 text-left">Tổng giá</th>
              <th className="p-2 text-left">Trạng thái</th>
              <th className="p-2 text-left">Thanh toán</th>
              <th className="p-2 text-left">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {paginatedBookings.map((booking) => (
              <tr
                key={booking.id}
                className="border-b hover:bg-gray-50"
              >
                <td className="p-2">{booking.id.substring(0, 8)}...</td>
                <td className="p-2">
                  <div>
                    <div className="font-medium">
                      {booking.customerName || "N/A"}
                    </div>
                    {booking.customerPhone && (
                      <div className="text-xs text-gray-500">
                        {booking.customerPhone}
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-2">
                  {formatDateTime(
                    booking.bookingDate,
                    booking.startTime
                  )}
                </td>
                <td className="p-2">
                  {formatCurrency(booking.totalPrice || 0)}
                </td>
                <td className="p-2">
                  {paymentLoading ? (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Đang tải...
                    </span>
                  ) : (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        booking.status === "CONFIRMED"
                          ? "bg-green-100 text-green-800"
                          : booking.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : booking.status === "COMPLETED"
                          ? "bg-blue-100 text-blue-800"
                          : booking.status === "CANCELLED"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {booking.status === "CONFIRMED"
                        ? "Đã xác nhận"
                        : booking.status === "PENDING"
                        ? "Chờ xác nhận"
                        : booking.status === "COMPLETED"
                        ? "Hoàn thành"
                        : booking.status === "CANCELLED"
                        ? "Đã hủy"
                        : booking.status}
                    </span>
                  )}
                </td>
                <td className="p-2">
                  {paymentLoading ? (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Đang tải...
                    </span>
                  ) : (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        paymentStatuses[booking.id] === "COMPLETED"
                          ? "bg-green-100 text-green-800"
                          : paymentStatuses[booking.id] === "UNPAID"
                          ? "bg-yellow-100 text-yellow-800"
                          : paymentStatuses[booking.id] === "REFUNDED"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {paymentStatuses[booking.id] === "COMPLETED"
                        ? "Đã thanh toán"
                        : paymentStatuses[booking.id] === "UNPAID"
                        ? "Chưa thanh toán"
                        : paymentStatuses[booking.id] === "REFUNDED"
                        ? "Đã hoàn tiền"
                        : "Chưa thanh toán"}
                    </span>
                  )}
                </td>
                <td className="p-2">
                  {paymentLoading ? (
                    <span className="text-xs text-gray-500">
                      Đang tải...
                    </span>
                  ) : paymentStatuses[booking.id] !== "COMPLETED" &&
                    paymentStatuses[booking.id] !== "REFUNDED" ? (
                    <div className="flex space-x-2">
                      <span
                        className="px-3 py-1 bg-[var(--primary-color)] text-white text-xs rounded hover:bg-[var(--primary-color)]/80 flex items-center cursor-pointer"
                        onClick={() => onVerify(booking.id)}
                        title="Nhập mã xác thực từ khách hàng"
                      >
                        <i className="fas fa-keyboard mr-1"></i> Xác
                        thực
                      </span>
                    </div>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onShowSizeChange={onPageChange}
      />
    </>
  );
});

BookingTable.displayName = 'BookingTable';

export default BookingTable; 