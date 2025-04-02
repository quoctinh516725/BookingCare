import React from "react";

const Transactions = () => {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Giao dịch</h2>
        <div className="flex gap-4">
          <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
            Xuất Excel
          </button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow">
        {/* Transactions content will go here */}
      </div>
    </div>
  );
};

export default Transactions;
