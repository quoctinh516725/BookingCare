import React from "react";

const UserList = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Danh sách người dùng</h2>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
          Thêm người dùng
        </button>
      </div>
      <div className="bg-white rounded-lg shadow">
        {/* Table content will go here */}
      </div>
    </div>
  );
};

export default UserList;
