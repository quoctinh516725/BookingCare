import React from "react";

const SpecialistList = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Danh sách chuyên viên</h2>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
          Thêm chuyên viên
        </button>
      </div>
      <div className="bg-white rounded-lg shadow">
        {/* Specialist list content will go here */}
      </div>
    </div>
  );
};

export default SpecialistList;
