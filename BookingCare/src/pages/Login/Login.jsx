import { Link, useNavigate } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import logo from "../../assets/logo.png";
import UserService from "../../../services/UserService";
import { useMutation } from "@tanstack/react-query";
import { MessageContext } from "../../contexts/MessageProvider.jsx";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/slices/userSlice.js";

function Login() {
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const message = useContext(MessageContext);
  const dispatch = useDispatch();

  const mutation = useMutation({
    mutationFn: (data) => UserService.loginUser(data),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ username, password });
  };

  const { data, isLoading, isSuccess, isError, error } = mutation;

  const handleGetDetailsUser = async (id, token) => {
    try {
      console.log("Getting user details for ID:", id);
      // Thử lấy thông tin user từ API /users/{id} trước
      try {
        const response = await UserService.getDetailUser(id, token);
        console.log("User details retrieved successfully:", response);
        dispatch(setUser({ ...response, access_token: token, id }));
        return response;
      } catch (error) {
        // Xử lý lỗi 403 Forbidden
        if (error.response && error.response.status === 403) {
          console.log("Permission error when accessing user details, trying profile API");
          
          // Thử lấy profile từ API /auth/profile
          try {
            const profileResponse = await UserService.getUserProfile(token);
            console.log("User profile retrieved:", profileResponse);
            
            if (profileResponse && profileResponse.id === id) {
              dispatch(setUser({ ...profileResponse, access_token: token }));
              return profileResponse;
            } else {
              console.warn("Profile ID doesn't match requested user ID");
              throw new Error("User profile mismatch");
            }
          } catch (profileError) {
            console.error("Failed to fetch user profile:", profileError);
            
            // Nếu cả hai cách đều thất bại, thử lấy từ JWT token
            const decoded = jwtDecode(token);
            if (decoded) {
              // Tạo thông tin người dùng tối thiểu từ JWT token
              const minimalUserData = {
                id: decoded.userId || id,
                username: decoded.sub || "user",
                email: decoded.email || "",
                role: decoded.role || localStorage.getItem("user_role") || "CUSTOMER",
                // Các trường khác sẽ được cập nhật sau khi refresh
              };
              
              console.log("Using minimal user data from JWT:", minimalUserData);
              dispatch(setUser({ ...minimalUserData, access_token: token }));
              
              // Lập lịch thử lại sau 1 giây
              setTimeout(() => {
                UserService.refreshToken().catch(e => console.error("Failed to refresh token:", e));
              }, 1000);
              
              return minimalUserData;
            }
            
            throw profileError;
          }
        } else {
          // Các lỗi khác
          console.error("Error retrieving user details:", error);
          throw error;
        }
      }
    } catch (error) {
      console.error("Final error in handleGetDetailsUser:", error);
      throw error;
    }
  };

  useEffect(() => {
    if (isSuccess) {
      const token = data?.token;
      localStorage.setItem("access_token", JSON.stringify(token));

      if (token) {
        const decoded = jwtDecode(token);
        if (decoded?.userId) {
          (async () => {
            try {
              // Đợi lấy chi tiết người dùng thành công
              await handleGetDetailsUser(decoded?.userId, token);
              
              // Chỉ hiển thị thông báo và chuyển hướng sau khi đã lấy dữ liệu thành công
              message.success("Đăng nhập thành công");
              navigate("/");
            } catch (error) {
              console.error("Lỗi khi lấy thông tin người dùng:", error);
              message.error("Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.");
            }
          })();
        }
      }
    }
    
    if (isError) {
      message.error(error?.response?.data?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
    }
  }, [isSuccess, isError, error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[var(--background-color)]">
      <div className="w-full max-w-[500px] mx-auto relative z-10">
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-2">
              <img className="h-[40px] rounded-xl" src={logo} alt="BeautyCare Logo" />
              <span className="text-[var(--primary-color)] font-semibold text-xl md:text-2xl">
                BeautyCare
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mt-5 mb-2">Đăng nhập</h1>
            <p className="text-base md:text-lg text-gray-600">
              Nhập thông tin tài khoản của bạn
            </p>
          </div>
          
          <div className="mt-8">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Tên tài khoản
                </label>
                <input
                  value={username}
                  onChange={(e) => setUserName(e.target.value)}
                  type="text"
                  name="username"
                  id="username"
                  placeholder="Nhập tên tài khoản..."
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[var(--primary-color)] text-sm"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={isShowPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    placeholder="Nhập mật khẩu..."
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[var(--primary-color)] text-sm"
                  />
                  <div
                   
                    onClick={() => setIsShowPassword(!isShowPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                  >
                    <i className={`fa-solid ${isShowPassword ? "fa-eye" : "fa-eye-slash"}`}></i>
                  </div>
                </div>
              </div>
              
              <button 
                type="submit" 
                className="w-full h-10 bg-[var(--primary-color)] hover:opacity-90 text-white rounded-md font-medium flex items-center justify-center transition-colors"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xử lý...
                  </>
                ) : "Đăng nhập"}
              </button>
            </form>
            
            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Chưa có tài khoản?
                <Link
                  to="/sign-up"
                  className="text-[var(--primary-color)] font-medium ml-1 hover:underline"
                >
                  Đăng ký
                </Link>
              </p>
              
              <div className="mt-3 border-t pt-3">
                <Link
                  to="/admin/login"
                  className="text-gray-500 text-sm hover:text-[var(--primary-color)]"
                >
                  Đăng nhập với tư cách quản trị viên
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
