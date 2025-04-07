import AdminDashboard from "../pages/admin/adminDashboard";
import UserList from "../pages/admin/user/UserList";
import UserRoles from "../pages/admin/user/UserRoles";
import PermissionGroups from "../pages/admin/permission/PermissionGroups";
import UserPermissions from "../pages/admin/permission/UserPermissions";
import ServiceList from "../pages/admin/service/ServiceList";
import ServiceCategories from "../pages/admin/service/ServiceCategories";
import SpecialistList from "../pages/admin/SpecialistList";
import BlogPosts from "../pages/admin/blog/BlogPosts";
import BlogCategories from "../pages/admin/blog/BlogCategories";
import Appointments from "../pages/admin/Appointments";
import Reports from "../pages/admin/Reports";
import Transactions from "../pages/admin/Transactions";
import Settings from "../pages/admin/Settings";
import AdminLayout from "../layouts/AdminLayout";
import AdminLogin from "../pages/admin/AdminLogin";

const routes = [
  {
    path: "/admin/login",
    page: AdminLogin,
    layout: null,
    isDefaultPage: false,
  },
  {
    path: "/admin",
    page: AdminDashboard,
    layout: AdminLayout,
    isDefaultPage: true,
  },
  {
    path: "/admin/list",
    page: UserList,
    layout: AdminLayout,
    isDefaultPage: true,
  },
  {
    path: "/admin/users/roles",
    page: UserRoles,
    layout: AdminLayout,
    isDefaultPage: true,
  },
  {
    path: "/admin/permissions/groups",
    page: PermissionGroups,
    layout: AdminLayout,
    isDefaultPage: true,
  },
  {
    path: "/admin/permissions/users",
    page: UserPermissions,
    layout: AdminLayout,
    isDefaultPage: true,
  },
  {
    path: "/admin/services",
    page: ServiceList,
    layout: AdminLayout,
    isDefaultPage: true,
  },
  {
    path: "/admin/services/categories",
    page: ServiceCategories,
    layout: AdminLayout,
    isDefaultPage: true,
  },
  {
    path: "/admin/specialists",
    page: SpecialistList,
    layout: AdminLayout,
    isDefaultPage: true,
  },
  {
    path: "/admin/blog/posts",
    page: BlogPosts,
    layout: AdminLayout,
    isDefaultPage: true,
  },
  {
    path: "/admin/blog/categories",
    page: BlogCategories,
    layout: AdminLayout,
    isDefaultPage: true,
  },
  {
    path: "/admin/appointments",
    page: Appointments,
    layout: AdminLayout,
    isDefaultPage: true,
  },
  {
    path: "/admin/reports",
    page: Reports,
    layout: AdminLayout,
    isDefaultPage: true,
  },
  {
    path: "/admin/transactions",
    page: Transactions,
    layout: AdminLayout,
    isDefaultPage: true,
  },
  {
    path: "/admin/settings",
    page: Settings,
    layout: AdminLayout,
    isDefaultPage: true,
  },
];

export default routes;
