import React, { useState } from "react";

const Transactions = () => {
  const [currentPage, setCurrentPage] = useState(1);

  // Mock transaction data
  const transactions = [
    {
      id: "TX12345",
      date: "15/06/2023 09:30",
      customer: "Nguyễn Văn A",
      service: "Chăm sóc da cơ bản",
      specialist: "Trần Thị B",
      amount: "450.000 đ",
      status: "Hoàn thành",
      paymentMethod: "Thẻ tín dụng",
    },
    {
      id: "TX12346",
      date: "15/06/2023 14:00",
      customer: "Lê Văn C",
      service: "Trị mụn chuyên sâu",
      specialist: "Phạm Văn D",
      amount: "650.000 đ",
      status: "Hoàn thành",
      paymentMethod: "Tiền mặt",
    },
    {
      id: "TX12347",
      date: "16/06/2023 10:15",
      customer: "Hoàng Thị E",
      service: "Trẻ hóa da",
      specialist: "Nguyễn Thị F",
      amount: "850.000 đ",
      status: "Hoàn thành",
      paymentMethod: "Chuyển khoản",
    },
    {
      id: "TX12348",
      date: "16/06/2023 16:30",
      customer: "Đỗ Văn G",
      service: "Massage mặt",
      specialist: "Lý Thị H",
      amount: "350.000 đ",
      status: "Đang xử lý",
      paymentMethod: "Thẻ tín dụng",
    },
    {
      id: "TX12349",
      date: "17/06/2023 11:00",
      customer: "Trịnh Văn I",
      service: "Tẩy trang chuyên sâu",
      specialist: "Bùi Thị K",
      amount: "250.000 đ",
      status: "Hoàn thành",
      paymentMethod: "Tiền mặt",
    },
    {
      id: "TX12350",
      date: "17/06/2023 13:45",
      customer: "Lương Thị L",
      service: "Trị nám",
      specialist: "Vũ Văn M",
      amount: "750.000 đ",
      status: "Thất bại",
      paymentMethod: "Thẻ tín dụng",
    },
    {
      id: "TX12351",
      date: "18/06/2023 09:00",
      customer: "Mai Văn N",
      service: "Chăm sóc da cơ bản",
      specialist: "Đinh Thị O",
      amount: "450.000 đ",
      status: "Hoàn thành",
      paymentMethod: "Chuyển khoản",
    },
    {
      id: "TX12352",
      date: "18/06/2023 15:30",
      customer: "Cao Thị P",
      service: "Trị mụn chuyên sâu",
      specialist: "Đặng Văn Q",
      amount: "650.000 đ",
      status: "Hoàn tiền",
      paymentMethod: "Thẻ tín dụng",
    },
    {
      id: "TX12353",
      date: "19/06/2023 10:30",
      customer: "Lâm Văn R",
      service: "Trẻ hóa da",
      specialist: "Hà Thị S",
      amount: "850.000 đ",
      status: "Hoàn thành",
      paymentMethod: "Tiền mặt",
    },
    {
      id: "TX12354",
      date: "19/06/2023 14:15",
      customer: "Trương Văn T",
      service: "Massage mặt",
      specialist: "Ngô Thị U",
      amount: "350.000 đ",
      status: "Đang xử lý",
      paymentMethod: "Chuyển khoản",
    },
  ];

  // Function to determine the status color
  const getStatusColorClass = (status) => {
    switch (status) {
      case "Hoàn thành":
        return "bg-green-100 text-green-800";
      case "Đang xử lý":
        return "bg-yellow-100 text-yellow-800";
      case "Hoàn tiền":
        return "bg-blue-100 text-blue-800";
      case "Thất bại":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className=" mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Quản lý giao dịch
          </h1>
          <div className="flex mt-4 md:mt-0 space-x-2">
            <span className=" flex items-center px-4 py-2 bg-[var(--primary-color)] border border-gray-300 rounded-md text-sm text-white hover:opacity-80 cursor-pointer">
              <i className="fas fa-download w-4 h-4 mr-2"></i>
              Xuất Excel
            </span>
            <span className="flex items-center px-4 py-2 bg-[var(--primary-color)] border border-gray-300 rounded-md text-sm text-white hover:opacity-80 cursor-pointer">
              <i className="fas fa-calendar w-4 h-4 mr-2"></i>
              Lọc theo ngày
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-5">
            <h2 className="text-lg font-medium text-gray-800">
              Giao dịch thanh toán
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Quản lý tất cả các giao dịch thanh toán trong hệ thống
            </p>
          </div>

          <div className="p-5">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <i className="fas fa-search w-5 h-5 text-gray-400"></i>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
                placeholder="Tìm kiếm theo ID..."
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID Giao dịch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dịch vụ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chuyên viên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phương thức
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transaction.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.service}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.specialist}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transaction.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`min-w-[75px] flex justify-center px-2 py-1 text-xs rounded-full ${getStatusColorClass(
                          transaction.status
                        )}`}
                      >
                        {transaction.status}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.paymentMethod}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
