import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Fragment, useEffect, useState } from "react";
import Default from "./components/Default";
import routes from "./routes";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";
import { setUser } from "./redux/slices/userSlice";
import UserService from "../services/UserService";

function App() {
  const dispatch = useDispatch();
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Xử lý việc khởi tạo thông tin người dùng một cách đồng bộ
  useEffect(() => {
    const initializeUserData = async () => {
      try {
        const { decoded, token } = handleDecodeToken();
        if (token && decoded?.userId) {
          // Đợi lấy thông tin người dùng hoàn tất
          await handleGetDetailsUser(decoded.userId, token);
        }
      } catch (error) {
        console.error("Error initializing user data:", error);
      } finally {
        // Đánh dấu đã hoàn tất khởi tạo, bất kể thành công hay thất bại
        setIsInitializing(false);
      }
    };

    initializeUserData();
  }, []);

  const handleGetDetailsUser = async (id, token) => {
    try {
      const response = await UserService.getDetailUser(id, token);
      dispatch(setUser({ ...response, access_token: token, id }));
      return response;
    } catch (error) {
      console.error("Error getting user details:", error);
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
          <div className="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-gray-600">Đang tải ứng dụng...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Router>
        <Routes>
          {routes.map((item, index) => {
            const Layout = item.isDefaultPage ? Default : Fragment;
            const Page = item.page;
            return (
              <Route
                key={index}
                path={item.path}
                element={
                  <Layout>
                    <Page />
                  </Layout>
                }
              />
            );
          })}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
