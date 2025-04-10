import { Link, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import { useMutation } from "@tanstack/react-query";
import UserService from "../../../services/UserService";
import logo from "../../assets/logo.png";
import { MessageContext } from "../../contexts/MessageProvider.jsx";

function SignUp() {
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUserName] = useState("");
  const navigate = useNavigate();
  const message = useContext(MessageContext);

  const mutation = useMutation({
    mutationFn: (data) => UserService.signUpUser(data),
    onSuccess: () => {
      message.success("Đăng ký thành công! Vui lòng đăng nhập");
      navigate("/login");
    },
    onError: (error) => {
      message.error(
        error?.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại."
      );
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      message.error("Mật khẩu xác nhận không khớp");
      return;
    }

    if (password.length < 8) {
      message.error("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }

    const registerData = {
      username,
      email,
      password,
    };
    mutation.mutate(registerData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[var(--background-color)]">
      <div className="w-full max-w-[500px] mx-auto relative z-10">
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-2">
              <img
                className="h-[40px] rounded-xl"
                src={logo}
                alt="BeautyCare Logo"
              />
              <span className="text-[var(--primary-color)] font-semibold text-xl md:text-2xl">
                BeautyCare
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mt-5 mb-2">
              Đăng ký
            </h1>
            <p className="text-base md:text-lg text-gray-600">
              Tạo tài khoản mới
            </p>
          </div>

          <div className="mt-8">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
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
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  name="email"
                  id="email"
                  placeholder="Nhập email..."
                  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[var(--primary-color)] text-sm"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
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
                    minLength={8}
                    required
                  />
                  <div
                    onClick={() => setIsShowPassword(!isShowPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                  >
                    <i
                      className={`fa-solid ${
                        isShowPassword ? "fa-eye" : "fa-eye-slash"
                      }`}
                    ></i>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <input
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    type={isShowPassword ? "text" : "password"}
                    name="confirmPassword"
                    id="confirmPassword"
                    placeholder="Nhập lại mật khẩu..."
                    className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[var(--primary-color)] text-sm"
                    minLength={8}
                    required
                  />
                  <div
                    onClick={() => setIsShowPassword(!isShowPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
                  >
                    <i
                      className={`fa-solid ${
                        isShowPassword ? "fa-eye" : "fa-eye-slash"
                      }`}
                    ></i>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-10 bg-[var(--primary-color)] hover:opacity-90 text-white rounded-md font-medium flex items-center justify-center transition-colors"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <>
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
                  </>
                ) : (
                  "Đăng ký"
                )}
              </button>
            </form>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-600">
                Đã có tài khoản?
                <Link
                  to="/login"
                  className="text-[var(--primary-color)] font-medium ml-1  "
                >
                  Đăng nhập
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
