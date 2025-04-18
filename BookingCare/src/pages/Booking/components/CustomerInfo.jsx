import React from "react";

const CustomerInfo = ({ formData, handleChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div>
        <p className="text-xl font-semibold mb-2">
          Họ và tên <span className="text-red-500">*</span>
        </p>
        <input
          type="text"
          name="fullName"
          id="fullName"
          placeholder="Nhập họ và tên..."
          className="w-full p-3 border-2 border-gray-200 rounded-lg outline-none focus:border-[var(--primary-color)] transition-colors"
          value={formData.fullName}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <p className="text-xl font-semibold mb-2">
          Số điện thoại <span className="text-red-500">*</span>
        </p>
        <input
          type="text"
          name="phone"
          id="phone"
          placeholder="Nhập số điện thoại..."
          className="w-full p-3 border-2 border-gray-200 rounded-lg outline-none focus:border-[var(--primary-color)] transition-colors"
          value={formData.phone}
          onChange={handleChange}
          required
        />
      </div>
    </div>
  );
};

export default CustomerInfo; 