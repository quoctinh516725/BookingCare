import React from "react";

const Appointments = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Lịch đặt</h2>
        <div className="flex gap-4">
          <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
            Xuất Excel
          </button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
            Thêm lịch đặt
          </button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow">
        {/* Appointments content will go here */}
      </div>
    </div>
  );
};

export default Appointments;
