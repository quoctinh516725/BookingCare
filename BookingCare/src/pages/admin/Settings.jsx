import React, { useState } from "react";

const Settings = () => {
  // State cho cài đặt
  const [settings, setSettings] = useState({
    websiteName: "BookingCare",
    email: "contact@bookingcare.com",
    phone: "0934364719",
    address: "123 Đường Trần Hưng Đạo, Quận 1, TP.HCM",
    description: "Chào mừng bạn đến với website của chúng tôi!",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // State cho thông báo lỗi
  const [errors, setErrors] = useState({});

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  // Xử lý submit
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    // Kiểm tra cài đặt chung
    if (!settings.websiteName.trim()) {
      newErrors.websiteName = "Tên trang web không được để trống";
    }
    if (!settings.email.trim()) {
      newErrors.email = "Email không được để trống";
    }

    // Kiểm tra mật khẩu (nếu có nhập)
    if (
      settings.currentPassword ||
      settings.newPassword ||
      settings.confirmPassword
    ) {
      if (!settings.currentPassword) {
        newErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
      }
      if (!settings.newPassword) {
        newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
      }
      if (settings.newPassword !== settings.confirmPassword) {
        newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Gửi dữ liệu đến API hoặc lưu (chưa triển khai)
      alert(
        "Cài đặt đã được lưu!" +
          (settings.newPassword ? " Mật khẩu đã được thay đổi!" : "")
      );
      // Reset mật khẩu nếu có thay đổi
      if (settings.newPassword) {
        setSettings((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Cài đặt hệ thống</h2>
      </div>

      <div className="max-w-6xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Cài đặt chung */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-6">
              Cài đặt chung
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Tên trang web
                </label>
                <input
                  type="text"
                  name="websiteName"
                  value={settings.websiteName}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] ${
                    errors.websiteName ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Nhập tên trang web"
                />
                {errors.websiteName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.websiteName}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Địa chỉ email
                </label>
                <input
                  type="email"
                  name="email"
                  value={settings.email}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Nhập email"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Số điện thoại
                </label>
                <input
                  type="text"
                  name="phone"
                  value={settings.phone}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                  placeholder="Nhập số điện thoại"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  name="address"
                  value={settings.address}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                  placeholder="Nhập địa chỉ"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Mô tả trang web
                </label>
                <textarea
                  name="description"
                  value={settings.description}
                  onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] h-32 resize-none"
                  placeholder="Nhập mô tả trang web"
                />
              </div>
            </div>
          </div>

          {/* Thay đổi mật khẩu */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-6">
              Thay đổi mật khẩu
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={settings.currentPassword}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] ${
                    errors.currentPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Nhập mật khẩu hiện tại"
                />
                {errors.currentPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.currentPassword}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={settings.newPassword}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] ${
                    errors.newPassword ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Nhập mật khẩu mới"
                />
                {errors.newPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.newPassword}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={settings.confirmPassword}
                  onChange={handleChange}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Xác nhận mật khẩu mới"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Nút lưu thay đổi */}
          <div className="col-span-1 lg:col-span-2 flex justify-end mt-6">
            <button
              type="submit"
              className="px-6 py-3 bg-[var(--primary-color)] text-white rounded-lg hover:bg-[var(--primary-color)] transition-colors duration-200 font-medium"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
