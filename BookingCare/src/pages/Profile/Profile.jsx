import { useState, useContext } from "react";
import { useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { MessageContext } from "../../contexts/MessageProvider.jsx";
import UserService from "../../../services/UserService";
import { setUser } from "../../redux/slices/userSlice";

function Profile() {
  const dispatch = useDispatch();
  const message = useContext(MessageContext);
  const {
    id,
    username,
    email,
    firstName,
    lastName,
    fullName,
    role,
    access_token,
  } = useSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState("profile");

  // State for user profile form
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [userInfo, setUserInfo] = useState({
    firstName: firstName || "",
    lastName: lastName || "",
    email: email || "",
    phone: "",
  });

  // State for password change form
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");

  // Handle profile update
  const updateProfileMutation = useMutation({
    mutationFn: (data) => UserService.updateUserInfo(id, data, access_token),
    onSuccess: (data) => {
      message.success("Thông tin đã được cập nhật thành công");
      dispatch(setUser({ ...data, access_token }));
      setIsEditingProfile(false);
    },
    onError: (error) => {
      message.error(error?.response?.data?.message || "Cập nhật thất bại");
    },
  });

  // Handle password change
  const changePasswordMutation = useMutation({
    mutationFn: (data) => UserService.changePassword(id, data, access_token),
    onSuccess: () => {
      message.success("Mật khẩu đã được cập nhật thành công");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    onError: (error) => {
      message.error(error?.response?.data?.message || "Đổi mật khẩu thất bại");
    },
  });

  // Handle user info change
  const handleUserInfoChange = (e) => {
    const { name, value } = e.target;
    setUserInfo({
      ...userInfo,
      [name]: value,
    });
  };

  // Handle password field change
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  // Handle profile update form submission
  const handleProfileUpdate = () => {
    // Chỉ gửi các trường cần thiết và có dữ liệu
    const updateData = {
      firstName: userInfo.firstName || undefined,
      lastName: userInfo.lastName || undefined,
      email: userInfo.email || undefined,
      phone: userInfo.phone || undefined,
    };

    // Loại bỏ các trường undefined
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    updateProfileMutation.mutate(updateData);
  };

  // Handle password change form submission
  const handlePasswordUpdate = () => {
    setPasswordError("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError("Mật khẩu mới phải có ít nhất 8 ký tự");
      return;
    }

    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  return (
    <div className="container mx-auto px-4 pt-[85px] pb-8">
      <div className="bg-white rounded overflow-hidden min-h-[70vh]">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className="w-full md:w-[240px] bg-gray-50 p-3 border-b md:border-b-0 md:border-r border-gray-100">
            <div className="mb-4 text-center">
              <div className="w-14 h-14 rounded-full bg-[var(--primary-color)] mx-auto flex items-center justify-center">
                <span className="text-white text-base font-medium">
                  {firstName && lastName
                    ? `${firstName.charAt(0)}${lastName.charAt(0)}`
                    : username?.charAt(0) || "U"}
                </span>
              </div>
              <h3 className="mt-2 text-sm font-medium truncate">
                {fullName || username}
              </h3>
              <p className="text-gray-500 text-xs truncate">{email}</p>
              {role && (
                <p className="text-xs text-[var(--primary-color)] mt-0.5">
                  {role}
                </p>
              )}
            </div>

            <nav className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-1 overflow-x-auto">
              <div
                onClick={() => setActiveTab("profile")}
                className={`text-left px-3 py-2 text-sm rounded flex items-center cursor-pointer flex-shrink-0 h-9 ${
                  activeTab === "profile"
                    ? "text-[var(--primary-color)] bg-white"
                    : "text-gray-600 hover:text-[var(--primary-color)]"
                }`}
              >
                <i
                  className={`fa-solid fa-user-circle mr-2 ${
                    activeTab === "profile"
                      ? "text-[var(--primary-color)]"
                      : "text-gray-400"
                  }`}
                ></i>
                <span className="truncate">Thông tin cá nhân</span>
              </div>
              <div
                onClick={() => setActiveTab("bookings")}
                className={`text-left px-3 py-2 text-sm rounded flex items-center cursor-pointer flex-shrink-0 h-9 ${
                  activeTab === "bookings"
                    ? "text-[var(--primary-color)] bg-white"
                    : "text-gray-600 hover:text-[var(--primary-color)]"
                }`}
              >
                <i
                  className={`fa-solid fa-calendar-check mr-2 ${
                    activeTab === "bookings"
                      ? "text-[var(--primary-color)]"
                      : "text-gray-400"
                  }`}
                ></i>
                <span className="truncate">Lịch hẹn của tôi</span>
              </div>
              <div
                onClick={() => setActiveTab("security")}
                className={`text-left px-3 py-2 text-sm rounded flex items-center cursor-pointer flex-shrink-0 h-9 ${
                  activeTab === "security"
                    ? "text-[var(--primary-color)] bg-white"
                    : "text-gray-600 hover:text-[var(--primary-color)]"
                }`}
              >
                <i
                  className={`fa-solid fa-shield-alt mr-2 ${
                    activeTab === "security"
                      ? "text-[var(--primary-color)]"
                      : "text-gray-400"
                  }`}
                ></i>
                <span className="truncate">Bảo mật</span>
              </div>
            </nav>
          </div>

          {/* Main content */}
          <div className="flex-1 p-4">
            {activeTab === "profile" && (
              <div>
                <h2 className="text-2xl font-medium text-gray-800 mb-3">
                  Thông tin cá nhân
                </h2>
                {!isEditingProfile ? (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 text-xs mb-1">
                          Tên đăng nhập
                        </label>
                        <p className="border-b border-gray-200 p-2 text-sm truncate">
                          {username}
                        </p>
                      </div>
                      <div>
                        <label className="block text-gray-700 text-xs mb-1">
                          Email
                        </label>
                        <p className="border-b border-gray-200 p-2 text-sm truncate">
                          {email}
                        </p>
                      </div>
                      <div>
                        <label className="block text-gray-700 text-xs mb-1">
                          Họ
                        </label>
                        <p className="border-b border-gray-200 p-2 text-sm truncate">
                          {firstName || "Chưa cập nhật"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-gray-700 text-xs mb-1">
                          Tên
                        </label>
                        <p className="border-b border-gray-200 p-2 text-sm truncate">
                          {lastName || "Chưa cập nhật"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <span
                        onClick={() => setIsEditingProfile(true)}
                        className="inline-flex items-center px-3 py-2 text-sm text-[var(--primary-color)] cursor-pointer h-9"
                      >
                        Chỉnh sửa thông tin
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 text-xs mb-1">
                          Họ
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={userInfo.firstName}
                          onChange={handleUserInfoChange}
                          className="w-full p-2 text-sm border-b border-gray-200 focus:outline-none focus:border-[var(--primary-color)]"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-xs mb-1">
                          Tên
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={userInfo.lastName}
                          onChange={handleUserInfoChange}
                          className="w-full p-2 text-sm border-b border-gray-200 focus:outline-none focus:border-[var(--primary-color)]"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-xs mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={userInfo.email}
                          onChange={handleUserInfoChange}
                          className="w-full p-2 text-sm border-b border-gray-200 focus:outline-none focus:border-[var(--primary-color)]"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-xs mb-1">
                          Số điện thoại
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={userInfo.phone}
                          onChange={handleUserInfoChange}
                          className="w-full p-2 text-sm border-b border-gray-200 focus:outline-none focus:border-[var(--primary-color)]"
                          placeholder="Nhập số điện thoại"
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex gap-3">
                      <span
                        onClick={handleProfileUpdate}
                        className="inline-flex items-center px-3 py-2 text-sm text-[var(--primary-color)]   cursor-pointer h-9"
                      >
                        {updateProfileMutation.isPending
                          ? "Đang cập nhật..."
                          : "Lưu thay đổi"}
                      </span>
                      <span
                        onClick={() => setIsEditingProfile(false)}
                        className="inline-flex items-center px-3 py-2 text-sm text-gray-500   cursor-pointer h-9"
                      >
                        Hủy
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === "bookings" && (
              <div>
                <h2 className="text-lg font-medium text-gray-800 mb-3">
                  Lịch hẹn của tôi
                </h2>
                <div className="bg-yellow-50 border-l-2 border-yellow-300 px-3 py-2 mb-3">
                  <p className="text-yellow-700 text-sm">
                    Hiện tại bạn chưa có lịch hẹn nào. Hãy đặt lịch để trải
                    nghiệm dịch vụ của chúng tôi.
                  </p>
                </div>
                <span className="inline-flex items-center px-3 py-2 text-sm text-[var(--primary-color)]   cursor-pointer h-9">
                  Đặt lịch ngay
                </span>
              </div>
            )}

            {activeTab === "security" && (
              <div>
                <h2 className="text-lg font-medium text-gray-800 mb-3">
                  Bảo mật tài khoản
                </h2>
                <div className="border-b border-gray-100 pb-4 mb-4">
                  <h3 className="text-base mb-3">Đổi mật khẩu</h3>
                  {passwordError && (
                    <div className="mb-3 bg-red-50 border-l-2 border-red-300 p-2">
                      <p className="text-red-700 text-xs">{passwordError}</p>
                    </div>
                  )}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-gray-700 text-xs mb-1">
                        Mật khẩu hiện tại
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full p-2 text-sm border-b border-gray-200 focus:outline-none focus:border-[var(--primary-color)]"
                        placeholder="Nhập mật khẩu hiện tại"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-xs mb-1">
                        Mật khẩu mới
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full p-2 text-sm border-b border-gray-200 focus:outline-none focus:border-[var(--primary-color)]"
                        placeholder="Nhập mật khẩu mới"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 text-xs mb-1">
                        Xác nhận mật khẩu mới
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full p-2 text-sm border-b border-gray-200 focus:outline-none focus:border-[var(--primary-color)]"
                        placeholder="Nhập lại mật khẩu mới"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span
                      onClick={handlePasswordUpdate}
                      className="inline-flex items-center px-3 py-2 text-sm text-[var(--primary-color)]   cursor-pointer h-9"
                    >
                      {changePasswordMutation.isPending
                        ? "Đang cập nhật..."
                        : "Cập nhật mật khẩu"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
