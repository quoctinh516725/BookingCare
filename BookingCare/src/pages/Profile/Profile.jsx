import React, { useState, useContext } from "react";
import { useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import Modal from "react-modal";
import { MessageContext } from "../../contexts/MessageProvider.jsx";
import UserService from "../../../services/UserService";
import { setUser } from "../../redux/slices/userSlice";
import FeedbackService from "../../../services/FeedbackService";

// Đảm bảo modal hoạt động tốt với screen reader
Modal.setAppElement("#root");

const customModalStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    maxWidth: "500px",
    width: "90%",
    borderRadius: "12px",
    padding: "0",
    border: "none",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    zIndex: 1000,
  },
};

function Profile() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
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

  // State for rating data
  const [ratingData, setRatingData] = useState({
    bookingId: "",
    rating: 5,
    comment: ""
  });
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [loading, setLoading] = useState({ rating: false });

  // Fetch bookings data
  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ["userBookings"],
    queryFn: UserService.getUserBookings,
    enabled: !!access_token,
  });
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

  // Handle booking cancellation
  const cancelBookingMutation = useMutation({
    mutationFn: (bookingId) => UserService.cancelBooking(bookingId),
    onSuccess: () => {
      message.success("Lịch hẹn đã được hủy thành công");
      queryClient.invalidateQueries(["userBookings"]);
    },
    onError: (error) => {
      message.error(
        error?.response?.data?.message ||
          "Không thể hủy lịch hẹn. Vui lòng thử lại sau."
      );
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
    const updateData = {
      firstName: userInfo.firstName || undefined,
      lastName: userInfo.lastName || undefined,
      email: userInfo.email || undefined,
      phone: userInfo.phone || undefined,
    };

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

  // Handle opening rating modal
  const openRatingModal = (bookingId) => {
    setRatingData({
      bookingId: bookingId,
      rating: 5,
      comment: ""
    });
    setShowRatingModal(true);
  };

  // Handle closing rating modal
  const closeRatingModal = () => {
    setShowRatingModal(false);
    setRatingData({
      bookingId: "",
      rating: 5,
      comment: ""
    });
  };

  const handleRatingChange = (value) => {
    setRatingData({
      ...ratingData,
      rating: value
    });
  };

  const handleCommentChange = (e) => {
    setRatingData({
      ...ratingData,
      comment: e.target.value
    });
  };

  const handleRatingSubmit = async () => {
    try {
      setLoading(prev => ({ ...prev, rating: true }));
      
      // Validate rating data
      if (!ratingData.bookingId) {
        message.error("Không tìm thấy thông tin đặt lịch");
        setLoading(prev => ({ ...prev, rating: false }));
        return;
      }
      
      if (!ratingData.rating || ratingData.rating < 1 || ratingData.rating > 5) {
        message.error("Vui lòng chọn số sao đánh giá từ 1-5");
        setLoading(prev => ({ ...prev, rating: false }));
        return;
      }
      
      // Chuẩn bị dữ liệu gửi đi
      const feedbackData = {
        bookingId: ratingData.bookingId,
        customerId: id,
        rating: ratingData.rating,
        comment: ratingData.comment || ""
      };
      
      // Gửi đánh giá sử dụng FeedbackService
      const response = await FeedbackService.createFeedback(feedbackData);
      
      if (response.success) {
        message.success(response.message || "Đánh giá thành công!");
        
        // Cập nhật UI để hiển thị đã đánh giá cho booking này
        queryClient.invalidateQueries(["userBookings"]);
        
        // Đóng modal
        closeRatingModal();
      } else {
        message.error(response.error || "Không thể gửi đánh giá. Vui lòng thử lại sau.");
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      message.error("Đã xảy ra lỗi khi gửi đánh giá. Vui lòng thử lại.");
    } finally {
      setLoading(prev => ({ ...prev, rating: false }));
    }
  };

  return (
    <div className="container mx-auto px-4 pt-[85px] pb-8 max-w-7xl">
      <div className="bg-white rounded-xl shadow-md overflow-hidden min-h-[70vh] border border-gray-100">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className="w-full md:w-[260px] bg-gray-50 p-5 border-b md:border-b-0 md:border-r border-gray-100">
            <div className="mb-6 text-center">
              <div className="w-20 h-20 rounded-full bg-[linear-gradient(to_right,var(--primary-color),white)] mx-auto flex items-center justify-center shadow-md">
                <span className="text-white text-xl font-semibold">
                  {firstName && lastName
                    ? `${firstName.charAt(0)}${lastName.charAt(0)}`
                    : username?.charAt(0) || "U"}
                </span>
              </div>
              <h3 className="mt-3 text-base font-medium truncate">
                {fullName || username}
              </h3>
              <p className="text-gray-500 text-sm truncate">{email}</p>
              {role && (
                <p className="mt-1 px-2 py-0.5 bg-blue-500/10 text-blue-500 text-xs rounded-full inline-block">
                  {role}
                </p>
              )}
            </div>

            <nav className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-2 overflow-x-auto">
              <div
                onClick={() => setActiveTab("profile")}
                className={`text-left px-4 py-3 text-sm rounded-lg flex items-center cursor-pointer flex-shrink-0 transition-colors ${
                  activeTab === "profile"
                    ? "text-[var(--primary-color)] bg-[var(--primary-color)]/10 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <i
                  className={`fa-solid fa-user-circle mr-3 text-lg ${
                    activeTab === "profile" ? "text-[var(--primary-color)]" : "text-gray-400"
                  }`}
                ></i>
                <span className="truncate">Thông tin cá nhân</span>
              </div>
              <div
                onClick={() => setActiveTab("bookings")}
                className={`text-left px-4 py-3 text-sm rounded-lg flex items-center cursor-pointer flex-shrink-0 transition-colors ${
                  activeTab === "bookings"
                    ? "text-[var(--primary-color)] bg-[var(--primary-color)]/10 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <i
                  className={`fa-solid fa-calendar-check mr-3 text-lg ${
                    activeTab === "bookings" ? "text-[var(--primary-color)]" : "text-gray-400"
                  }`}
                ></i>
                <span className="truncate">Lịch hẹn của tôi</span>
              </div>
              <div
                onClick={() => setActiveTab("security")}
                className={`text-left px-4 py-3 text-sm rounded-lg flex items-center cursor-pointer flex-shrink-0 transition-colors ${
                  activeTab === "security"
                    ? "text-[var(--primary-color)] bg-[var(--primary-color)]/10 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <i
                  className={`fa-solid fa-shield-alt mr-3 text-lg ${
                    activeTab === "security" ? "text-[var(--primary-color)]" : "text-gray-400"
                  }`}
                ></i>
                <span className="truncate">Bảo mật</span>
              </div>
            </nav>
          </div>

          {/* Main content */}
          <div className="flex-1 p-6">
            {activeTab === "profile" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <i className="fas fa-user-circle text-blue-500 mr-3"></i>
                  Thông tin cá nhân
                </h2>

                {!isEditingProfile ? (
                  <>
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="grid md:grid-cols-2 gap-0">
                        <div className="p-4 border-b md:border-b-0 md:border-r border-gray-100">
                          <label className="block text-gray-500 text-xs uppercase tracking-wide mb-1 font-medium">
                            Tên đăng nhập
                          </label>
                          <p className="text-gray-800 font-medium">
                            {username}
                          </p>
                        </div>
                        <div className="p-4 border-b md:border-b-0 border-gray-100">
                          <label className="block text-gray-500 text-xs uppercase tracking-wide mb-1 font-medium">
                            Email
                          </label>
                          <p className="text-gray-800 font-medium truncate">
                            {email}
                          </p>
                        </div>
                        <div className="p-4 border-b md:border-b-0 md:border-r border-gray-100">
                          <label className="block text-gray-500 text-xs uppercase tracking-wide mb-1 font-medium">
                            Họ
                          </label>
                          <p className="text-gray-800 font-medium">
                            {firstName || (
                              <span className="text-gray-400 italic">
                                Chưa cập nhật
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="p-4">
                          <label className="block text-gray-500 text-xs uppercase tracking-wide mb-1 font-medium">
                            Tên
                          </label>
                          <p className="text-gray-800 font-medium">
                            {lastName || (
                              <span className="text-gray-400 italic">
                                Chưa cập nhật
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <span
                        onClick={() => setIsEditingProfile(true)}
                        className="inline-flex items-center px-4 py-2 bg-[var(--primary-color)] cursor-pointer text-white text-sm font-medium rounded-lg transition-colors hover:bg-[var(--primary-color)]"
                      >
                        <i className="fas fa-pencil-alt mr-2"></i>
                        Chỉnh sửa thông tin
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-gray-500 text-xs uppercase tracking-wide mb-2 font-medium">
                            Họ
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            value={userInfo.firstName}
                            onChange={handleUserInfoChange}
                            className="w-full p-3 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Nhập họ của bạn"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-500 text-xs uppercase tracking-wide mb-2 font-medium">
                            Tên
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            value={userInfo.lastName}
                            onChange={handleUserInfoChange}
                            className="w-full p-3 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Nhập tên của bạn"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-500 text-xs uppercase tracking-wide mb-2 font-medium">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={userInfo.email}
                            onChange={handleUserInfoChange}
                            className="w-full p-3 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Nhập email của bạn"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-500 text-xs uppercase tracking-wide mb-2 font-medium">
                            Số điện thoại
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={userInfo.phone}
                            onChange={handleUserInfoChange}
                            className="w-full p-3 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Nhập số điện thoại của bạn"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <span
                        onClick={handleProfileUpdate}
                        className="px-4 py-2 bg-[var(--primary-color)] cursor-pointer text-white text-sm font-medium rounded-lg transition-colors hover:bg-[var(--primary-color)] flex items-center"
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending ? (
                          <>
                            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                            <span>Đang cập nhật...</span>
                          </>
                        ) : (
                          <>
                            <i className="fas fa-save mr-2"></i>
                            <span>Lưu thay đổi</span>
                          </>
                        )}
                      </span>
                      <span
                        onClick={() => setIsEditingProfile(false)}
                        className="px-4 py-2 bg-gray-200 cursor-pointer text-gray-700 text-sm font-medium rounded-lg transition-colors hover:bg-gray-300 flex items-center"
                      >
                        <i className="fas fa-times mr-2"></i>
                        <span>Hủy</span>
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === "bookings" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <i className="fas fa-calendar-check text-blue-500 mr-3"></i>
                  Lịch hẹn của tôi
                </h2>

                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <i className="fas fa-info-circle text-blue-500 text-xl mt-0.5"></i>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-blue-800 font-semibold">
                        Chính sách hủy lịch
                      </h4>
                      <p className="text-blue-700 text-sm mt-1">
                        Bạn có thể hủy lịch hẹn miễn phí trước 24 giờ. Việc hủy
                        lịch muộn hơn có thể phát sinh phí.
                      </p>
                    </div>
                  </div>
                </div>

                {bookingsLoading ? (
                  <div className="flex justify-center items-center py-20">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="ml-4 text-gray-600">Đang tải lịch hẹn...</p>
                  </div>
                ) : bookings && bookings.length > 0 ? (
                  <div className="space-y-6">
                    {bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white"
                      >
                        <div className="bg-gray-50 px-5 py-3 flex justify-between items-center border-b border-gray-100">
                          <div className="flex items-center">
                            <i className="fas fa-calendar-alt text-gray-400 mr-2"></i>
                            <span className="text-sm font-medium text-gray-700">
                              Ngày đặt: {booking.formattedDateTime}
                            </span>
                          </div>
                          <div>
                            <span
                              className={`text-xs px-3 py-1 rounded-full font-medium ${
                                booking.status === "PENDING"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : booking.status === "CONFIRMED"
                                  ? "bg-blue-100 text-blue-800"
                                  : booking.status === "COMPLETED"
                                  ? "bg-green-100 text-green-800"
                                  : booking.status === "CANCELLED"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {booking.statusDescription}
                            </span>
                          </div>
                        </div>
                        <div className="p-5">
                          <div className="mb-4">
                            <h3 className="font-semibold text-gray-800 text-base mb-3 flex items-center">
                              <i className="fas fa-concierge-bell text-blue-500 mr-2"></i>
                              Dịch vụ đã đặt
                            </h3>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <ul className="divide-y divide-gray-200">
                                {booking.services.map((service) => (
                                  <li
                                    key={service.id}
                                    className="flex justify-between py-2 text-sm"
                                  >
                                    <div className="flex items-center">
                                      <i className="fas fa-check-circle text-green-500 mr-2"></i>
                                      <span className="text-gray-800">
                                        {service.name}
                                      </span>
                                    </div>
                                    <span className="font-medium">
                                      {new Intl.NumberFormat("vi-VN", {
                                        style: "currency",
                                        currency: "VND",
                                      }).format(service.price)}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-gray-500 text-xs mb-1">
                                Chuyên viên
                              </p>
                              <p className="font-medium text-gray-800 flex items-center">
                                <i className="fas fa-user-tie text-blue-500 mr-2"></i>
                                {booking.staffName}
                              </p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-gray-500 text-xs mb-1">
                                Tổng tiền
                              </p>
                              <p className="font-medium text-gray-800 flex items-center">
                                <i className="fas fa-money-bill-wave text-green-500 mr-2"></i>
                                {new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                }).format(booking.totalPrice)}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 flex justify-end gap-3">
                            {booking.canCancel && (
                              <span
                                className="px-4 py-2 text-sm bg-red-50 cursor-pointer text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors flex items-center focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-50"
                                onClick={() => {
                                  if (window.confirm("Bạn có chắc chắn muốn hủy lịch hẹn này không?")) {
                                    cancelBookingMutation.mutate(booking.id);
                                  }
                                }}
                              >
                                <i className="fas fa-times-circle mr-2"></i>
                                <span>Hủy lịch hẹn</span>
                              </span>
                            )}
                            {booking.status === "COMPLETED" &&
                              !booking.feedback && (
                                <span
                                  className="px-4 py-2 text-sm bg-blue-50 cursor-pointer text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                                  onClick={() => openRatingModal(booking.id)}
                                >
                                  <i className="fas fa-star mr-2"></i>
                                  <span>Đánh giá</span>
                                </span>
                              )}
                          </div>

                          {booking.feedback && (
                            <div className="mt-4">
                              <h3 className="font-semibold text-gray-800 text-base mb-3 flex items-center">
                                <i className="fas fa-comment-dots text-blue-500 mr-2"></i>
                                Đánh giá dịch vụ
                              </h3>
                              <div className="flex items-center mb-2">
                                {[...Array(5)].map((_, index) => (
                                  <i
                                    key={index}
                                    className={`fas fa-star text-sm ${
                                      index < booking.rating
                                        ? "text-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                  ></i>
                                ))}
                              </div>
                              <p className="text-gray-600">
                                {booking.feedback}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-sm">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <i className="fas fa-exclamation-circle text-yellow-500 text-xl mt-0.5"></i>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-yellow-800 font-medium">
                          Chưa có lịch hẹn
                        </h4>
                        <p className="text-yellow-700 text-sm mt-1">
                          Hiện tại bạn chưa có lịch hẹn nào. Hãy đặt lịch để
                          trải nghiệm dịch vụ của chúng tôi.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                
              </div>
            )}

            {activeTab === "security" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <i className="fas fa-shield-alt text-blue-500 mr-3"></i>
                  Bảo mật tài khoản
                </h2>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
                  <div className="border-b border-gray-100 bg-gray-50 px-5 py-4">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <i className="fas fa-key text-blue-500 mr-2"></i>
                      Đổi mật khẩu
                    </h3>
                  </div>

                  <div className="p-5">
                    {passwordError && (
                      <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
                        <i className="fas fa-exclamation-circle text-red-500 mr-2 mt-0.5"></i>
                        <p className="text-red-700 text-sm">{passwordError}</p>
                      </div>
                    )}

                    <div className="space-y-5">
                      <div>
                        <label className="block text-gray-500 text-xs uppercase tracking-wide mb-2 font-medium">
                          Mật khẩu hiện tại
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="relative">
                          <i className="fas fa-lock absolute left-3 top-3.5 text-gray-400"></i>
                          <input
                            type="password"
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            className="w-full pl-10 pr-3 py-3 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Nhập mật khẩu hiện tại"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-500 text-xs uppercase tracking-wide mb-2 font-medium">
                          Mật khẩu mới
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="relative">
                          <i className="fas fa-key absolute left-3 top-3.5 text-gray-400"></i>
                          <input
                            type="password"
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            className="w-full pl-10 pr-3 py-3 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Nhập mật khẩu mới (ít nhất 8 ký tự)"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          <i className="fas fa-info-circle mr-1"></i>
                          Mật khẩu phải có ít nhất 8 ký tự
                        </p>
                      </div>

                      <div>
                        <label className="block text-gray-500 text-xs uppercase tracking-wide mb-2 font-medium">
                          Xác nhận mật khẩu mới
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="relative">
                          <i className="fas fa-check-circle absolute left-3 top-3.5 text-gray-400"></i>
                          <input
                            type="password"
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            className="w-full pl-10 pr-3 py-3 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Nhập lại mật khẩu mới"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <span
                        onClick={handlePasswordUpdate}
                        className="px-4 py-2 bg-[var(--primary-color)] inline-block cursor-pointer text-white text-sm font-medium rounded-lg transition-colors hover:bg-[var(--primary-color)] flex items-center"
                        disabled={changePasswordMutation.isPending}
                      >
                        {changePasswordMutation.isPending ? (
                          <>
                            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                            <span>Đang cập nhật...</span>
                          </>
                        ) : (
                          <>
                            <i className="fas fa-key mr-2"></i>
                            <span>Cập nhật mật khẩu</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                    <i className="fas fa-shield-alt text-blue-500 mr-2"></i>
                    Mẹo bảo mật
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex">
                      <i className="fas fa-check-circle text-green-500 mr-2 mt-0.5"></i>
                      <span>
                        Sử dụng mật khẩu mạnh với ít nhất 8 ký tự, bao gồm chữ
                        hoa, chữ thường, số và ký tự đặc biệt
                      </span>
                    </li>
                    <li className="flex">
                      <i className="fas fa-check-circle text-green-500 mr-2 mt-0.5"></i>
                      <span>
                        Không sử dụng cùng một mật khẩu cho nhiều tài khoản khác
                        nhau
                      </span>
                    </li>
                    <li className="flex">
                      <i className="fas fa-check-circle text-green-500 mr-2 mt-0.5"></i>
                      <span>
                        Thay đổi mật khẩu định kỳ để tăng cường bảo mật
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      <Modal
        isOpen={showRatingModal}
        onRequestClose={closeRatingModal}
        style={customModalStyles}
      >
        <div className="bg-white rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              Đánh giá dịch vụ
            </h2>
            <span
              onClick={closeRatingModal}
              className="text-gray-500 cursor-pointer hover:text-gray-700 transition-colors duration-200"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </span>
          </div>

          <div className="space-y-6">
            {/* No rating error handling in the new code */}

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Đánh giá của bạn
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="flex items-center gap-2">
                {[...Array(5)].map((_, index) => (
                  <span
                    key={index}
                    onClick={() => handleRatingChange(index + 1)}
                    className="cursor-pointer focus:outline-none"
                  >
                    <i
                      className={`fas fa-star text-2xl ${
                        index < ratingData.rating ? "text-yellow-400" : "text-gray-300"
                      }`}
                    ></i>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Nhận xét
              </label>
              <textarea
                value={ratingData.comment}
                onChange={handleCommentChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] h-32 resize-none"
                placeholder="Chia sẻ cảm nhận của bạn về dịch vụ..."
              />
            </div>

            <div className="flex justify-end gap-3">
              <span
                onClick={closeRatingModal}
                className="px-4 py-2 bg-gray-200 cursor-pointer text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Hủy
              </span>
              <span
                onClick={handleRatingSubmit}
                className="px-4 py-2 bg-[var(--primary-color)] cursor-pointer text-white rounded-lg hover:bg-[var(--primary-color)] transition-colors font-medium flex items-center"
                disabled={loading.rating}
              >
                {loading.rating ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane mr-2"></i>
                    <span>Gửi đánh giá</span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Profile;
