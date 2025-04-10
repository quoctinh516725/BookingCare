import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { useContext, useEffect } from "react";
import { MessageContext } from "../../contexts/MessageProvider.jsx";

const AdminProtectedRoute = () => {
  // Get user state from Redux
  const user = useSelector((state) => state.user);
  
  // Get message context for notifications
  const message = useContext(MessageContext);

  // Check user role from Redux store (primary source of truth)
  const isAdminOrStaff = user && (user.role === "ADMIN" || user.role === "STAFF");
  
  // Fallback to localStorage if Redux state isn't ready
  const accessToken = localStorage.getItem("access_token");
  const storedRole = localStorage.getItem("user_role");
  const isStoredAdminOrStaff = storedRole === "ADMIN" || storedRole === "STAFF";
  
  // User is authorized if they have the right role in Redux OR in localStorage
  const isAuthorized = isAdminOrStaff || (accessToken && isStoredAdminOrStaff);

  // Show error message only once on initial render if not authenticated
  useEffect(() => {
    if (!isAuthorized) {
      console.log("Access denied. User role:", user?.role || storedRole || "Unknown");
      message.error("Bạn cần đăng nhập với tư cách quản trị viên để truy cập trang này");
    }
  }, []);

  // Log current authentication state
  useEffect(() => {
    console.log("Admin route protection - Auth state:", {
      hasUser: !!user,
      reduxRole: user?.role,
      storedRole,
      isAuthorized
    });
  }, [user, storedRole, isAuthorized]);

  // Redirect to admin login if not authenticated or not an admin/staff
  if (!isAuthorized) {
    return <Navigate to="/admin/login" replace />;
  }

  // Render child routes if authenticated as admin or staff
  return <Outlet />;
};

export default AdminProtectedRoute; 