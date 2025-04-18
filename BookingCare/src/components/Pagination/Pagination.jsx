import React, { memo } from "react";
import { Pagination as AntPagination } from "antd";

const CustomPagination = memo(({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  loading = false
}) => {
  if (totalItems === 0) return null;

  // Component hiển thị khi đang tải dữ liệu
  if (loading) {
    return (
      <div className="flex items-center justify-center mt-4">
        <div className="animate-pulse w-1/3 h-8 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center mt-4">      
      <AntPagination
        current={currentPage}
        total={totalItems}
        pageSize={pageSize}
        onChange={onPageChange}
        showSizeChanger={false} // Vô hiệu hóa thay đổi kích thước trang để cải thiện hiệu suất
        showQuickJumper={false} // Vô hiệu hóa nhảy nhanh đến trang để đơn giản hóa giao diện
        style={{ marginBottom: "20px" }}
      />
    </div>
  );
});

export default CustomPagination;
