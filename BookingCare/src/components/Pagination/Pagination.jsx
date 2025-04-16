import React from "react";
import { Pagination as AntPagination } from "antd";

const CustomPagination = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
}) => {
  if (totalItems === 0) return null;

  return (
    <div className="flex items-center justify-center mt-4">      
      <AntPagination
        current={currentPage}
        total={totalItems}
        pageSize={pageSize}
        onChange={onPageChange}
      />
    </div>
  );
};

export default CustomPagination;
