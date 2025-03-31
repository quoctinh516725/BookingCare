import React from "react";

const Settings = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Cài đặt hệ thống</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Cài đặt chung</h3>
          {/* General settings form will go here */}
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Cài đặt thông báo</h3>
          {/* Notification settings form will go here */}
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Cài đặt thanh toán</h3>
          {/* Payment settings form will go here */}
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Cài đặt email</h3>
          {/* Email settings form will go here */}
        </div>
      </div>
    </div>
  );
};

export default Settings;
