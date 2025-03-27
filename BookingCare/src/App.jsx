import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Fragment, useEffect } from "react";
import Default from "./components/Default";
import routes from "./routes";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";
import { setUser } from "./redux/slices/userSlice";
import UserService from "../services/UserService";
import axios from "axios";
function App() {
  const dispatch = useDispatch();
  useEffect(() => {
    const { decoded, token } = handleDecodeToken();
    if (token) {
      if (decoded?.userId) {
        handleGetDetailsUser(decoded?.userId, token);
      }
    }
  }, []);
  const handleGetDetailsUser = async (id, token) => {
    try {
      const response = await UserService.getDetailUser(id, token);
      dispatch(setUser({ ...response, access_token: token }));
    } catch (error) {
      console.log("Error get details user", error);
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
  return (
    <div>
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
