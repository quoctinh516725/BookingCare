import React, { useState } from "react";
import Modal from "react-modal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminService from "../../../../services/AdminService";
import { toast } from "sonner";
import Pagination from "../../../components/Pagination";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    width: "500px",
    maxWidth: "90%",
    borderRadius: "8px",
    padding: "20px",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
};

const UserList = () => {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    phone: "",
    password: "",
    role: "CUSTOMER",
  });
  const [formError, setFormError] = useState({
    hasError: false,
    message: "",
    details: [],
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

  // Fetch users data
  const {
    data: usersData = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      try {
        console.log("Fetching users from UserList component");
        const data = await AdminService.getAllUsers();
        console.log("Received user data:", data);
        setTotalItems(data.length);
        setUsers(data);
        return data;
      } catch (error) {
        console.error("Error in UserList query function:", error);

        // Check for specific error types
        if (error.response && error.response.status === 403) {
          toast.error("Bạn không có quyền xem danh sách người dùng");
          throw new Error(
            "Không có quyền truy cập: Bạn không có quyền xem danh sách người dùng"
          );
        }

        throw error;
      }
    },
    // Retry đến 2 lần nếu có lỗi
    retry: 2,
    // Báo lỗi chi tiết
    onError: (err) => {
      console.error("Query error in UserList:", err);
      toast.error(`Không thể tải danh sách người dùng: ${err.message}`);
    },
  });

  // Làm mới dữ liệu
  const refreshData = () => {
    refetch();
    toast.info("Đang làm mới dữ liệu người dùng...");
  };

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: AdminService.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Người dùng đã được tạo thành công!");
      toast.dismiss("creating-user");
      setFormError({
        hasError: false,
        message: "",
        details: [],
      });
      closeModal();
    },
    onError: (error) => {
      console.error("Error creating user:", error);

      toast.dismiss("creating-user");

      let errorMessage = "Không thể tạo người dùng. Vui lòng thử lại.";
      let errorDetails = [];

      if (error.response) {
        if (error.response.data) {
          if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.data.error) {
            errorMessage = error.response.data.error;
          } else if (typeof error.response.data === "string") {
            errorMessage = error.response.data;
          }

          if (error.response.data.details) {
            errorDetails = Array.isArray(error.response.data.details)
              ? error.response.data.details
              : [error.response.data.details];
          }

          if (error.response.data.violations) {
            errorDetails = error.response.data.violations.map(
              (v) => `${v.field}: ${v.message}`
            );
          }
        }

        const statusCode = error.response.status;
        if (statusCode) {
          errorMessage = `[${statusCode}] ${errorMessage}`;

          switch (statusCode) {
            case 400:
              errorMessage = `Dữ liệu không hợp lệ: ${errorMessage}`;
              break;
            case 401:
              errorMessage = `Không có quyền truy cập: ${errorMessage}`;
              break;
            case 403:
              errorMessage = `Không đủ quyền hạn: ${errorMessage}`;
              break;
            case 409:
              errorMessage = `Xung đột dữ liệu: ${errorMessage}`;
              if (errorMessage.toLowerCase().includes("email")) {
                errorDetails.push(
                  "Email đã được sử dụng, vui lòng chọn email khác"
                );
              }
              if (errorMessage.toLowerCase().includes("username")) {
                errorDetails.push(
                  "Tên đăng nhập đã tồn tại, vui lòng chọn tên đăng nhập khác"
                );
              }
              break;
            case 500:
              errorMessage = `Lỗi máy chủ: ${errorMessage}`;
              break;
          }
        }
      } else if (error.request) {
        errorMessage =
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.";
      } else if (error.message) {
        errorMessage = error.message;

        if (error.detail) {
          errorDetails.push(
            error.detail.message || "Không có thông tin chi tiết"
          );
        }
      }

      toast.error(`Lỗi: ${errorMessage}`);

      setFormError({
        hasError: true,
        message: errorMessage,
        details: errorDetails,
      });

      console.error("Detailed error info:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }) => AdminService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Cập nhật người dùng thành công!");
      closeModal();
    },
    onError: (error) => {
      console.error("Error updating user:", error);
      toast.error(
        error.response?.data?.message ||
          "Không thể cập nhật người dùng. Vui lòng thử lại."
      );
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (id) => AdminService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Người dùng đã được xóa thành công!");
    },
    onError: (error) => {
      console.error("Error deleting user:", error);
      toast.error(
        error.response?.data?.message ||
          "Không thể xóa người dùng. Vui lòng thử lại."
      );
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "username") {
      const sanitizedValue = value.replace(/\s+/g, "");
      setFormData((prev) => ({
        ...prev,
        [name]: sanitizedValue,
      }));

      if (value !== sanitizedValue) {
        toast.info("Tên đăng nhập không được chứa khoảng trắng", {
          id: "username-whitespace",
          duration: 3000,
        });
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    setFormError({
      hasError: false,
      message: "",
      details: [],
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const userData = { ...formData };

    const validationErrors = [];

    if (!userData.firstName || userData.firstName.trim() === "") {
      validationErrors.push("Họ không được để trống");
    }

    if (!userData.lastName || userData.lastName.trim() === "") {
      validationErrors.push("Tên không được để trống");
    }

    if (!userData.email || userData.email.trim() === "") {
      validationErrors.push("Email không được để trống");
    } else if (!/^\S+@\S+\.\S+$/.test(userData.email)) {
      validationErrors.push("Email không hợp lệ");
    }

    if (!userData.username || userData.username.trim() === "") {
      validationErrors.push("Tên đăng nhập không được để trống");
    } else if (userData.username.length < 3) {
      validationErrors.push("Tên đăng nhập phải có ít nhất 3 ký tự");
    }

    if (userData.phone) {
      userData.phone = userData.phone.trim();
      if (!/^\d{10}$/.test(userData.phone)) {
        validationErrors.push("Số điện thoại phải có đúng 10 chữ số");
      }
    } else {
      validationErrors.push("Số điện thoại không được để trống");
    }

    // Kiểm tra mật khẩu (chỉ khi tạo mới hoặc có nhập mật khẩu khi cập nhật)
    if (!isEditMode) {
      if (!userData.password || userData.password.trim() === "") {
        validationErrors.push("Mật khẩu không được để trống");
      } else if (userData.password.length < 6) {
        validationErrors.push("Mật khẩu phải có ít nhất 6 ký tự");
      }
    } else if (
      userData.password &&
      userData.password.length < 6 &&
      userData.password.trim() !== ""
    ) {
      validationErrors.push("Mật khẩu phải có ít nhất 6 ký tự");
    }

    if (validationErrors.length > 0) {
      // Cập nhật: hiển thị tất cả các lỗi validation trong form thay vì chỉ lỗi đầu tiên
      toast.error(
        `Đã xảy ra ${validationErrors.length} lỗi khi kiểm tra dữ liệu nhập vào`
      );

      // Cập nhật state formError để hiển thị tất cả các lỗi
      setFormError({
        hasError: true,
        message: "Vui lòng kiểm tra và sửa các lỗi sau:",
        details: validationErrors,
      });

      console.error("Validation errors:", validationErrors);
      return;
    }

    console.log("Submitting user data:", userData);

    if (isEditMode && selectedUser) {
      if (!userData.password || userData.password.trim() === "") {
        delete userData.password;
      }

      if (!userData.role) {
        userData.role = selectedUser.role;
      }

      updateUserMutation.mutate({
        id: selectedUser.id,
        data: userData,
      });
    } else {
      createUserMutation.mutate(userData);

      toast.info("Đang tạo người dùng mới...", {
        id: "creating-user",
        duration: 5000,
      });
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      username: user.username || "",
      phone: user.phoneNumber || "",
      password: "",
      role: user.role || "CUSTOMER",
    });
    setIsEditMode(true);
    setIsOpen(true);
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này không?")) {
      deleteUserMutation.mutate(userId);
    }
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setSelectedUser(null);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      phone: "",
      password: "",
      role: "CUSTOMER",
    });
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setIsEditMode(false);
    setSelectedUser(null);
  };

  const filteredUsers = users.filter(
    (user) =>
      (user.firstName &&
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.lastName &&
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email &&
        user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.username &&
        user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.fullName &&
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Add pagination logic
  const indexOfLastItem = currentPage * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold mb-6">Quản lý người dùng</h1>
        <div className="flex gap-2">
          <span
            onClick={openAddModal}
            className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md cursor-pointer"
          >
            <i className="fas fa-plus-circle"></i>
            <span>Thêm người dùng</span>
          </span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-grow">
          <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          <input
            type="text"
            placeholder="Tìm kiếm người dùng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : isError ? (
        <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6">
          <h3 className="text-lg font-medium mb-2">Lỗi khi tải dữ liệu</h3>
          <p className="mb-2">
            {error?.message || "Không thể tải danh sách người dùng"}
          </p>
          {error?.response?.status === 403 && (
            <div className="mt-2 text-sm bg-red-100 p-3 rounded">
              <p className="font-medium">Lỗi quyền truy cập:</p>
              <ul className="list-disc list-inside mt-1">
                <li>
                  Tài khoản của bạn không có quyền xem danh sách người dùng
                </li>
                <li>Vui lòng đăng nhập với tài khoản có quyền quản trị</li>
                <li>Hoặc liên hệ quản trị viên để được cấp quyền</li>
              </ul>
            </div>
          )}
          <div className="mt-4">
            <button
              onClick={refreshData}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
            >
              <i className="fas fa-sync-alt"></i>
              <span>Thử lại</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-md shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số điện thoại
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                    </div>
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    Không tìm thấy người dùng nào
                  </td>
                </tr>
              ) : (
                currentItems.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.fullName ||
                        (user.firstName && user.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : user.username)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          user.role === "ADMIN"
                            ? "bg-red-100 text-red-800"
                            : user.role === "STAFF"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.phoneNumber || "Chưa cập nhật"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                      <span
                        className="text-blue-500 hover:text-blue-700 bg-blue-100 hover:bg-blue-200 p-1 rounded mr-2 cursor-pointer"
                        onClick={() => handleEditUser(user)}
                      >
                        <i className="fas fa-edit"></i>
                      </span>
                      <span
                        className="text-red-500 hover:text-red-700 bg-red-100 hover:bg-red-200 p-1 rounded cursor-pointer"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <i className="fas fa-trash-alt"></i>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add pagination */}
      <Pagination
        currentPage={currentPage}
        totalItems={filteredUsers.length}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      />

      <Modal
        isOpen={isOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel={isEditMode ? "Chỉnh sửa người dùng" : "Thêm người dùng"}
      >
        <div className="bg-white rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              {isEditMode ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
            </h2>
            <span
              onClick={closeModal}
              className="text-gray-400 hover:text-gray-500 cursor-pointer"
            >
              <i className="fas fa-times"></i>
            </span>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            {isEditMode
              ? "Cập nhật thông tin người dùng"
              : "Nhập thông tin để tạo tài khoản người dùng mới"}
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Hiển thị thông báo lỗi */}
            {formError.hasError && (
              <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4">
                <p className="font-medium">{formError.message}</p>
                {formError.details.length > 0 && (
                  <ul className="mt-2 text-sm list-disc list-inside">
                    {formError.details.map((detail, index) => (
                      <li key={index}>{detail}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Nguyễn"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="Văn A"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="example@email.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên đăng nhập
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="username"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                placeholder="0901234567"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu {isEditMode && "(Để trống nếu không đổi)"}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required={!isEditMode}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vai trò
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="CUSTOMER">Khách hàng</option>
                <option value="STAFF">Nhân viên</option>
                <option value="ADMIN">Quản trị viên</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <span
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Hủy
              </span>
              <button
                type="submit"
                disabled={
                  createUserMutation.isPending || updateUserMutation.isPending
                }
                className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createUserMutation.isPending ||
                updateUserMutation.isPending ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Đang xử lý...
                  </span>
                ) : isEditMode ? (
                  "Cập nhật"
                ) : (
                  "Tạo mới"
                )}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default UserList;
