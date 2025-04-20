import React, { useState, useMemo } from "react";
import { useAppointments } from "../../contexts/AppointmentContext";
import AppointmentRow from "./AppointmentRow";
import Pagination from "../../../../components/Pagination";

const AppointmentTable = () => {
  const { appointments, loading, error, showCancelled } = useAppointments();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter appointments based on search and showCancelled
  const filteredAppointments = useMemo(() => {
    let filtered = [...appointments];

    if (!showCancelled) {
      filtered = filtered.filter(
        (appointment) => appointment.status !== "CANCELLED"
      );
    }

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((appointment) => {
        return (
          appointment.customerName?.toLowerCase().includes(term) ||
          appointment.customerEmail?.toLowerCase().includes(term) ||
          appointment.customerPhone?.toLowerCase().includes(term) ||
          appointment.staffName?.toLowerCase().includes(term) ||
          appointment.services?.some((s) =>
            s.name?.toLowerCase().includes(term)
          )
        );
      });
    }

    return filtered;
  }, [appointments, showCancelled, searchTerm]);

  // Get paginated data
  const getPaginatedData = useMemo(() => {
    const totalItems = filteredAppointments.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    
    // Ensure current page is valid
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }

    const indexOfLastItem = currentPage * pageSize;
    const indexOfFirstItem = indexOfLastItem - pageSize;
    
    return {
      data: filteredAppointments.slice(indexOfFirstItem, indexOfLastItem),
      totalItems,
    };
  }, [filteredAppointments, currentPage, pageSize]);

  // Handle page change
  const handlePageChange = (page, newPageSize) => {
    setCurrentPage(page);
    if (newPageSize) {
      setPageSize(newPageSize);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-800">
          Danh sách lịch đặt
        </h2>
        <div className="relative w-64">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <i className="fas fa-search w-5 h-5 text-gray-400"></i>
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
            placeholder="Tìm kiếm lịch đặt..."
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-pink-500 hover:text-pink-600"
          >
            Thử lại
          </button>
        </div>
      ) : (
        <>
          <div className="overflow-x-hidden">
            <table className="min-w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3 border-b">Khách hàng</th>
                  <th className="px-6 py-3 border-b">Liên hệ</th>
                  <th className="px-6 py-3 border-b">Dịch vụ</th>
                  <th className="px-6 py-3 border-b">Chuyên viên</th>
                  <th className="px-6 py-3 border-b">Ngày giờ</th>
                  <th className="px-6 py-3 border-b">Trạng thái</th>
                  <th className="px-6 py-3 border-b">Thanh toán</th>
                  <th className="px-6 py-3 border-b">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {getPaginatedData.data.length > 0 ? (
                  getPaginatedData.data.map((appointment) => (
                    <AppointmentRow
                      key={appointment.id}
                      appointment={appointment}
                    />
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="text-center text-gray-500 p-2 font-medium"
                    >
                      Không có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={getPaginatedData.totalItems}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onShowSizeChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default AppointmentTable; 