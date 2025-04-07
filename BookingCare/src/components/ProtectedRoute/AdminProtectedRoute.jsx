import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { useContext, useEffect } from "react";
import { MessageContext } from "../../contexts/MessageProvider.jsx";

const AdminProtectedRoute = () => {
  // Get user state from Redux (same as regular user authentication)
  const user = useSelector((state) => state.user);
  
  // Check for admin flag in localStorage
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  
  // Get access token from localStorage
  const accessToken = localStorage.getItem("access_token");
  
  // Get message context for notifications
  const message = useContext(MessageContext);

  // Show error message only once on initial render if not authenticated
  useEffect(() => {
    if (!user || !accessToken || !isAdmin) {
      message.error("Bạn cần đăng nhập với tư cách quản trị viên để truy cập trang này");
    }
  }, []);

  // Redirect to admin login if not authenticated or not an admin
  if (!user || !accessToken || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  // Render child routes if authenticated as admin
  return <Outlet />;
};

export default AdminProtectedRoute; 