import React from "react";

const Reports = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Báo cáo & Thống kê</h2>
        <div className="flex gap-4">
          <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
            Xuất báo cáo
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Thống kê doanh thu</h3>
          {/* Revenue chart will go here */}
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Thống kê đặt lịch</h3>
          {/* Appointments chart will go here */}
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Thống kê dịch vụ</h3>
          {/* Services chart will go here */}
        </div>
      </div>
    </div>
  );
};

export default Reports;
