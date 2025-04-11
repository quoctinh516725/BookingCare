import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useContext } from "react";
import { MessageContext } from "../../contexts/MessageProvider.jsx";
import { logout } from "../../redux/slices/userSlice";
import UserService from "../../../services/UserService";
import logo from "../../assets/logo.png";
import { PermissionGuard, PermissionMenuItem } from "../Permission";

function AdminSidebar() {
  const [openMenus, setOpenMenus] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const message = useContext(MessageContext);
  const location = useLocation();

  const handleNavigate = (url) => {
    navigate(url);
  };

  const handleLogout = async () => {
    try {
      // Call logout API
      await UserService.logoutUser();
      
      // Clear user state in Redux
      dispatch(logout());
      
      // Clear localStorage items
      localStorage.removeItem("access_token");
      localStorage.removeItem("isAdmin");
      
      // Show success message
      message.success("Đăng xuất thành công");
      
      // Navigate to login page
      navigate("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
      message.error("Đã xảy ra lỗi khi đăng xuất");
    }
  };

  const toggleMenu = (index) => {
    setOpenMenus((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="w-[278px] h-full border-r border-gray-200 flex flex-col justify-between">
      <div>
        <div className="flex items-center space-x-2 border-b border-gray-200 p-3">
          <img className="h-[40px] rounded-xl" src={logo} alt="BeautyCare Logo" />
          <span className="text-[var(--primary-color)] font-semibold text-2xl">
            BeautyCare
          </span>
        </div>
        <div className="flex flex-col mt-5 cursor-pointer list-none">
          {/* Tổng quan - luôn hiển thị */}
          <div
            className={`flex items-center space-x-2 p-3 ${
              location.pathname === "/admin" ? "bg-gray-200" : ""
            } `}
            onClick={() => handleNavigate("/admin")}
          >
            <i className="fas fa-chart-pie text-2xl min-w-[30px] text-gray-500"></i>
            <span>Tổng quan</span>
          </div>

          {/* Quản lý người dùng */}
          <PermissionGuard permission="user:view">
            <div className="flex flex-col space-y-2 p-3">
              <div
                className="flex space-x-2 items-center"
                onClick={() => toggleMenu("users")}
              >
                <i className="fas fa-users text-2xl min-w-[30px] text-gray-500"></i>
                <div className="flex flex-col mr-auto">
                  <span>Quản lý người dùng</span>
                </div>
                <i
                  className={`fa-solid fa-angle-down ${
                    openMenus["users"] ? "rotate-180" : ""
                  }`}
                ></i>
              </div>
              {openMenus["users"] && (
                <div className="flex flex-col list-none">
                  <PermissionMenuItem
                    permission="user:view"
                    to="/admin/list"
                    icon="fas fa-user"
                    location={location}
                  >
                    Danh sách người dùng
                  </PermissionMenuItem>
                  <PermissionMenuItem
                    permission="role:view"
                    to="/admin/users/roles"
                    icon="fas fa-user-tag"
                    location={location}
                  >
                    Vai trò người dùng
                  </PermissionMenuItem>
                </div>
              )}
            </div>
          </PermissionGuard>

          {/* Phân quyền hệ thống */}
          <PermissionGuard permission={["permission:view", "permission_group:view"]}>
            <div className="flex flex-col space-y-2 p-3">
              <div
                className="flex space-x-2 items-center"
                onClick={() => toggleMenu("permissions")}
              >
                <i className="fas fa-key text-2xl min-w-[30px] text-gray-500"></i>
                <div className="flex flex-col mr-auto">
                  <span>Phân quyền hệ thống</span>
                </div>
                <i
                  className={`fa-solid fa-angle-down ${
                    openMenus["permissions"] ? "rotate-180" : ""
                  }`}
                ></i>
              </div>
              {openMenus["permissions"] && (
                <div className="flex flex-col list-none">
                  <PermissionMenuItem
                    permission="permission_group:view"
                    to="/admin/permissions/groups"
                    icon="fas fa-layer-group"
                    location={location}
                  >
                    Nhóm quyền
                  </PermissionMenuItem>
                  <PermissionMenuItem
                    permission="user_permission:view"
                    to="/admin/permissions/users"
                    icon="fas fa-user-shield"
                    location={location}
                  >
                    Phân quyền người dùng
                  </PermissionMenuItem>
                </div>
              )}
            </div>
          </PermissionGuard>

          {/* Quản lý dịch vụ */}
          <PermissionGuard permission="service:view">
            <div className="flex flex-col space-y-2 p-3">
              <div
                className="flex space-x-2 items-center"
                onClick={() => toggleMenu("services")}
              >
                <i className="fas fa-file-circle-plus text-2xl min-w-[30px] text-gray-500"></i>
                <div className="flex flex-col mr-auto">
                  <span>Quản lý dịch vụ</span>
                </div>
                <i
                  className={`fa-solid fa-angle-down ${
                    openMenus["services"] ? "rotate-180" : ""
                  }`}
                ></i>
              </div>
              {openMenus["services"] && (
                <div className="flex flex-col list-none">
                  <PermissionMenuItem
                    permission="service:view"
                    to="/admin/services"
                    icon="fas fa-list"
                    location={location}
                  >
                    Danh sách dịch vụ
                  </PermissionMenuItem>
                  <PermissionMenuItem
                    permission="service:manage"
                    to="/admin/services/categories"
                    icon="fas fa-tags"
                    location={location}
                  >
                    Danh mục
                  </PermissionMenuItem>
                </div>
              )}
            </div>
          </PermissionGuard>

          {/* Quản lý chuyên viên */}
          <PermissionGuard permission="specialist:view">
            <div className="flex flex-col space-y-2 p-3">
              <div
                className="flex space-x-2 items-center"
                onClick={() => toggleMenu("specialists")}
              >
                <i className="fas fa-user-tie text-2xl min-w-[30px] text-gray-500"></i>
                <div className="flex flex-col mr-auto">
                  <span>Quản lý chuyên viên</span>
                </div>
                <i
                  className={`fa-solid fa-angle-down ${
                    openMenus["specialists"] ? "rotate-180" : ""
                  }`}
                ></i>
              </div>
              {openMenus["specialists"] && (
                <div className="flex flex-col list-none">
                  <PermissionMenuItem
                    permission="specialist:view"
                    to="/admin/specialists"
                    icon="fas fa-id-badge"
                    location={location}
                  >
                    Danh sách chuyên viên
                  </PermissionMenuItem>
                </div>
              )}
            </div>
          </PermissionGuard>

          {/* Quản lý blog */}
          <PermissionGuard permission="blog:view">
            <div className="flex flex-col space-y-2 p-3">
              <div
                className="flex space-x-2 items-center"
                onClick={() => toggleMenu("blog")}
              >
                <i className="fas fa-book-open text-2xl min-w-[30px] text-gray-500"></i>
                <div className="flex flex-col mr-auto">
                  <span>Quản lý blog</span>
                </div>
                <i
                  className={`fa-solid fa-angle-down ${
                    openMenus["blog"] ? "rotate-180" : ""
                  }`}
                ></i>
              </div>
              {openMenus["blog"] && (
                <div className="flex flex-col list-none">
                  <PermissionMenuItem
                    permission="blog:view"
                    to="/admin/blog/posts"
                    icon="fas fa-file-alt"
                    location={location}
                  >
                    Danh sách bài viết
                  </PermissionMenuItem>
                  <PermissionMenuItem
                    permission="blog:manage"
                    to="/admin/blog/categories"
                    icon="fas fa-folder-open"
                    location={location}
                  >
                    Danh mục
                  </PermissionMenuItem>
                </div>
              )}
            </div>
          </PermissionGuard>

          {/* Lịch đặt */}
          <PermissionMenuItem
            permission="booking:view"
            to="/admin/appointments"
            icon="fas fa-calendar-alt"
            location={location}
          >
            Lịch đặt
          </PermissionMenuItem>

          {/* Báo cáo & Thống kê */}
          <PermissionMenuItem
            permission="report:view"
            to="/admin/reports"
            icon="fas fa-chart-line"
            location={location}
          >
            Báo cáo & Thống kê
          </PermissionMenuItem>

          {/* Giao dịch */}
          <PermissionMenuItem
            permission="transaction:view"
            to="/admin/transactions"
            icon="fas fa-pager"
            location={location}
          >
            Giao dịch
          </PermissionMenuItem>

          {/* Cài đặt */}
          <PermissionGuard permission="admin:access">
            <div
              className={`flex items-center space-x-2 p-3 ${
                location.pathname === "/admin/settings" ? "bg-gray-200" : ""
              }`}
              onClick={() => handleNavigate("/admin/settings")}
            >
              <i className="fas fa-cog text-2xl min-w-[30px] text-gray-500"></i>
              <span>Cài đặt</span>
            </div>
          </PermissionGuard>
        </div>
      </div>
      
      {/* Logout button */}
      <div 
        className="flex items-center space-x-2 p-4 border-t border-gray-200 text-red-500 hover:bg-gray-100 cursor-pointer mt-auto mb-5"
        onClick={handleLogout}
      >
        <i className="fas fa-sign-out-alt text-2xl min-w-[30px]"></i>
        <span className="font-medium">Đăng xuất</span>
      </div>
    </div>
  );
}

export default AdminSidebar;
