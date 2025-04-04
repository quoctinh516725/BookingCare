import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/logo.png";
function AdminSidebar() {
  const [openMenus, setOpenMenus] = useState({});
  const navigate = useNavigate();
  const handleNavigate = (url) => {
    navigate(url);
  };
  const location = useLocation();

  const toggleMenu = (index) => {
    setOpenMenus((prev) => {
      return {
        ...prev,
        [index]: !prev[index],
      };
    });
  };
  const sideBarOptions = [
    { title: "Tổng quan", icon: "fas fa-chart-pie", url: "/admin" },
    {
      title: "Quản lý người dùng",
      icon: "fas fa-users",
      children: [
        {
          title: "Danh sách người dùng",
          icon: "fas fa-user",
          url: "/admin/list",
        },
        {
          title: "Vai trò người dùng",
          icon: "fas fa-user-tag",
          url: "/admin/users/roles",
        },
      ],
    },
    {
      title: "Phân quyền hệ thống",
      icon: "fas fa-key",
      children: [
        {
          title: "Nhóm quyền",
          icon: "fas fa-layer-group",
          url: "/admin/permissions/groups",
        },
        {
          title: "Phân quyền người dùng",
          icon: "fas fa-user-shield",
          url: "/admin/permissions/users",
        },
      ],
    },
    {
      title: "Quản lý dịch vụ",
      icon: "fas fa-file-circle-plus",
      children: [
        {
          title: "Danh sách dịch vụ",
          icon: "fas fa-list",
          url: "/admin/services",
        },
        {
          title: "Danh mục",
          icon: "fas fa-tags",
          url: "/admin/services/categories",
        },
      ],
    },
    {
      title: "Quản lý chuyên viên",
      icon: "fas fa-user-tie",
      children: [
        {
          title: "Danh sách chuyên viên",
          icon: "fas fa-id-badge",
          url: "/admin/specialists",
        },
      ],
    },
    {
      title: "Quản lý blog",
      icon: "fas fa-book-open",
      children: [
        {
          title: "Danh sách bài viết",
          icon: "fas fa-file-alt",
          url: "/admin/blog/posts",
        },
        {
          title: "Danh mục",
          icon: "fas fa-folder-open",
          url: "/admin/blog/categories",
        },
      ],
    },
    {
      title: "Lịch đặt",
      icon: "fas fa-calendar-alt",
      url: "/admin/appointments",
    },
    {
      title: "Báo cáo & Thống kê",
      icon: "fas fa-chart-line",
      url: "/admin/reports",
    },
    { title: "Giao dịch", icon: "fas fa-pager", url: "/admin/transactions" },
    { title: "Cài đặt", icon: "fas fa-cog", url: "/admin/settings" },
  ];
  return (
    <div className="w-[278px] h-full border-r border-gray-200">
      <div className="flex items-center space-x-2 border-b border-gray-200 p-3">
        <img className="h-[40px] rounded-xl" src={logo} alt="" />
        <span className="text-[var(--primary-color)] font-semibold text-2xl">
          BeautyCare
        </span>
      </div>
      <div className="flex flex-col mt-5 cursor-pointer">
        {sideBarOptions.map((option, index) =>
          option.children ? (
            <div className="flex flex-col space-y-2 p-3 " key={index}>
              <div
                className="flex space-x-2 items-center "
                onClick={() => toggleMenu(index)}
              >
                <i
                  className={`fa-solid fa-${option.icon} text-2xl min-w-[30px] text-gray-500`}
                ></i>
                <div className="flex flex-col mr-auto">
                  <span>{option.title}</span>
                </div>
                <i
                  className={`fa-solid fa-angle-down ${
                    openMenus[index] ? "rotate-180" : ""
                  }`}
                ></i>
              </div>
              {openMenus[index] && (
                <div className="flex flex-col">
                  {option.children.map((child, index) => (
                    <div
                      className={`transition-colors duration-300 ${
                        child.url === location.pathname
                          ? "bg-gray-200 rounded-md"
                          : ""
                      } hover:text-[var(--primary-color)]`}
                    >
                      <div
                        key={index}
                        className="flex items-center space-x-2 p-2  ml-8"
                        onClick={() => handleNavigate(child.url)}
                      >
                        <span>{child.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div
              key={index}
              className="flex items-center space-x-2 p-3"
              onClick={() => handleNavigate(option.url)}
            >
              <i
                className={`fa-solid fa-${option.icon} text-2xl min-w-[30px] text-gray-500`}
              ></i>
              <span>{option.title}</span>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default AdminSidebar;
