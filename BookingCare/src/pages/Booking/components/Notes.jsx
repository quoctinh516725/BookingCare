import React from "react";

const Notes = ({ formData, handleChange }) => {
  return (
    <div className="mb-6">
      <p className="text-xl font-semibold mb-2">Ghi chú</p>
      <textarea
        name="notes"
        id="notes"
        placeholder="Nhập ghi chú nếu có..."
        className="w-full p-3 border-2 border-gray-200 rounded-lg outline-none focus:border-[var(--primary-color)] transition-colors"
        rows={4}
        value={formData.notes}
        onChange={handleChange}
      ></textarea>
    </div>
  );
};

export default Notes; 