import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Fragment, useEffect, useState } from "react";
import routes from "./routes";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";
import { setUser } from "./redux/slices/userSlice";
import UserService from "services/UserService";
import Modal from "react-modal";
import logo from "./assets/logo.png";
import ServiceDetail from './pages/Service/ServiceDetail';
import SpecialistDetail from './pages/Specialist/SpecialistDetail';
import BlogDetail from './pages/Blog/BlogDetail';
import BlogList from './pages/Blog/BlogList';
import AdminProtectedRoute from './components/ProtectedRoute/AdminProtectedRoute';

Modal.setAppElement("#root");

function App() {
  const dispatch = useDispatch();
  const [isInitializing, setIsInitializing] = useState(true);

  // Xử lý việc khởi tạo thông tin người dùng một cách đồng bộ
  useEffect(() => {
    const initializeUserData = async () => {
      try {
        console.log("Initializing user data...");
        const { decoded, token } = handleDecodeToken();
        
        if (token && decoded?.userId) {
          console.log("Found valid token, retrieving user details...");
          
          try {
            // Đợi lấy thông tin người dùng hoàn tất
            await handleGetDetailsUser(decoded.userId, token);
          } catch (error) {
            console.error("Error getting user details:", error);
            
            // Nếu lỗi 403, thử lấy thông tin từ profile API
            if (error.response && error.response.status === 403) {
              console.log("Permission error, trying profile API...");
              try {
                const profileData = await UserService.getUserProfile(token);
                if (profileData) {
                  console.log("Profile data retrieved successfully");
                  dispatch(setUser({ ...profileData, access_token: token }));
                }
              } catch (profileError) {
                console.error("Error getting profile:", profileError);
                
                // Nếu không thể lấy profile, sử dụng thông tin từ JWT token
                const userRole = localStorage.getItem("user_role") || decoded.role || "CUSTOMER";
                console.log("Using minimal data from JWT with role:", userRole);
                
                dispatch(setUser({ 
                  id: decoded.userId, 
                  username: decoded.sub || "",
                  email: decoded.email || "",
                  role: userRole,
                  access_token: token
                }));
              }
            }
          }
        } else {
          console.log("No valid token found, skipping user initialization");
        }
      } catch (error) {
        console.error("Error in initializeUserData:", error);
      } finally {
        // Đánh dấu đã hoàn tất khởi tạo, bất kể thành công hay thất bại
        setIsInitializing(false);
      }
    };

    initializeUserData();
  }, []);

  const handleGetDetailsUser = async (id, token) => {
    try {
      console.log("Getting user details for ID:", id);
      
      // Thử lấy thông tin user từ API /users/{id} trước
      try {
        const response = await UserService.getDetailUser(id, token);
        console.log("User details retrieved successfully");
        dispatch(setUser({ ...response, access_token: token, id }));
        return response;
      } catch (error) {
        // Xử lý lỗi 403 Forbidden
        if (error.response && error.response.status === 403) {
          console.log("Permission error when accessing user details, trying profile API");
          
          // Thử lấy profile từ API /auth/profile
          try {
            const profileResponse = await UserService.getUserProfile(token);
            
            if (profileResponse && profileResponse.id) {
              console.log("Profile retrieved successfully");
              dispatch(setUser({ ...profileResponse, access_token: token }));
              return profileResponse;
            } else {
              console.warn("Profile API returned incomplete data");
            }
          } catch (profileError) {
            console.error("Failed to fetch profile:", profileError);
          }
        }
        
        // Re-throw original error to be handled by caller
        throw error;
      }
    } catch (error) {
      console.error("Final error in handleGetDetailsUser:", error);
      throw error;
    }
  };

  const handleDecodeToken = () => {
    try {
      const tokenString = localStorage.getItem("access_token");
      if (!tokenString) {
        console.log("No token found in localStorage");
        return { decoded: {}, token: null };
      }

      const token = JSON.parse(tokenString);
      if (!token) {
        console.log("Token is empty or invalid");
        return { decoded: {}, token: null };
      }

      const decoded = jwtDecode(token);
      return { decoded, token };
    } catch (error) {
      console.error("Error decoding token:", error);
      return { decoded: {}, token: null };
    }
  };

  // Apply authorization header to all axios requests
  UserService.axiosJWT.interceptors.request.use(
    async (config) => {
      // Always include credentials
      config.withCredentials = true;

      const currentTime = new Date().getTime();
      const { decoded, token } = handleDecodeToken();

      // Check if token is expired and needs refresh
      if (decoded?.exp && decoded.exp < currentTime / 1000) {
        try {
          const data = await UserService.refreshToken();
          if (data?.token) {
            // Update the Authorization header with the new token
            config.headers.Authorization = `Bearer ${data.token}`;

            // Store the new token
            localStorage.setItem("access_token", JSON.stringify(data.token));

            // Cập nhật lại thông tin người dùng khi token được refresh
            if (data.userId) {
              await handleGetDetailsUser(data.userId, data.token);
            }
          }
        } catch (error) {
          console.error("Error refreshing token:", error);
          // Could handle redirect to login here
        }
      } else if (token) {
        // Token exists and is valid, set the Authorization header
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    function (error) {
      return Promise.reject(error);
    }
  );

  // Hiển thị loading khi đang khởi tạo
  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background-color)]">
        <div className="text-center">
          {/* <div className="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mx-auto"></div> */}
          <p className="mt-3 text-gray-600">
            <img
              src={logo}
              alt="logo"
              className="w-20 h-20 rounded-2xl transform animate-spin"
            />
          </p>
        </div>
      </div>
    );
  }

  // Separate public and admin routes for better organization
  const publicRoutes = routes.filter(route => 
    !route.path.startsWith("/admin") || route.path === "/admin/login"
  );
  
  const adminRoutes = routes.filter(route => 
    route.path.startsWith("/admin") && route.path !== "/admin/login"
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Router>
        <Routes>
          {/* Public routes - including login pages and user area */}
          {publicRoutes.map((item, index) => {
            const Layout = item?.isDefaultPage ? item.layout : Fragment;
            const Page = item.page;
            
            return (
              <Route
                key={`public-${index}`}
                path={item.path}
                element={
                  <Layout>
                    <Page />
                  </Layout>
                }
              />
            );
          })}
          
          {/* Admin protected routes */}
          <Route element={<AdminProtectedRoute />}>
            {adminRoutes.map((item, index) => {
              const Layout = item?.isDefaultPage ? item.layout : Fragment;
              const Page = item.page;
              return (
                <Route
                  key={`admin-${index}`}
                  path={item.path}
                  element={
                    <Layout>
                      <Page />
                    </Layout>
                  }
                />
              );
            })}
          </Route>
          
          {/* Detail routes */}
          <Route path="/service/:id" element={<ServiceDetail />} />
          <Route path="/specialist/:id" element={<SpecialistDetail />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/blog" element={<BlogList />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
