import React, { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import * as XLSX from "xlsx";

// Dữ liệu giả cho báo cáo
const revenueData = [
  { month: "Tháng 1", revenue: 4000 },
  { month: "Tháng 2", revenue: 3000 },
  { month: "Tháng 3", revenue: 5000 },
  { month: "Tháng 4", revenue: 4500 },
  { month: "Tháng 5", revenue: 6000 },
  { month: "Tháng 6", revenue: 5500 },
];

const appointmentData = [
  { month: "Tháng 1", appointments: 120 },
  { month: "Tháng 2", appointments: 90 },
  { month: "Tháng 3", appointments: 150 },
  { month: "Tháng 4", appointments: 130 },
  { month: "Tháng 5", appointments: 170 },
  { month: "Tháng 6", appointments: 160 },
];

const serviceData = [
  { name: "Tẩy tế bào chết toàn thân", value: 500 },
  { name: "Trẻ hóa da", value: 600 },
  { name: "Chăm sóc da cơ bản", value: 400 },
  { name: "Trị liệu chuyên sâu", value: 700 },
  { name: "Điều trị mụn chuyên sâu", value: 650 },
  { name: "Massage và thư giãn", value: 550 },
];

// Màu sắc cho biểu đồ tròn
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#FF6384",
  "#36A2EB",
];

const Reports = () => {
  const [timeRange, setTimeRange] = useState("6months");

  const handleExport = () => {
    // Tạo workbook mới
    const wb = XLSX.utils.book_new();

    // Tạo sheet cho doanh thu
    const revenueWsData = [
      ["Tháng", "Doanh thu"],
      ...revenueData.map((item) => [item.month, item.revenue]),
    ];
    const revenueWs = XLSX.utils.aoa_to_sheet(revenueWsData);
    XLSX.utils.book_append_sheet(wb, revenueWs, "Doanh thu");

    // Tạo sheet cho đặt lịch
    const appointmentWsData = [
      ["Tháng", "Số lịch đặt"],
      ...appointmentData.map((item) => [item.month, item.appointments]),
    ];
    const appointmentWs = XLSX.utils.aoa_to_sheet(appointmentWsData);
    XLSX.utils.book_append_sheet(wb, appointmentWs, "Đặt lịch");

    // Tạo sheet cho dịch vụ
    const serviceWsData = [
      ["Dịch vụ", "Số lượng"],
      ...serviceData.map((item) => [item.name, item.value]),
    ];
    const serviceWs = XLSX.utils.aoa_to_sheet(serviceWsData);
    XLSX.utils.book_append_sheet(wb, serviceWs, "Dịch vụ");

    // Xuất file Excel
    XLSX.writeFile(wb, `BaoCao_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Báo cáo & Thống kê</h2>
        <div className="flex gap-4">
          <select
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="6months">6 tháng gần nhất</option>
            <option value="3months">3 tháng gần nhất</option>
            <option value="1month">1 tháng gần nhất</option>
          </select>
          <span
            onClick={handleExport}
            className="bg-[var(--primary-color)] font-medium text-white px-4 py-2 rounded-lg hover:bg-[var(--primary-color)] cursor-pointer"
          >
            Xuất báo cáo
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Thống kê doanh thu */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Thống kê doanh thu
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Thống kê đặt lịch */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Thống kê đặt lịch
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appointmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="appointments" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Thống kê dịch vụ */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">
            Thống kê dịch vụ
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {serviceData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
