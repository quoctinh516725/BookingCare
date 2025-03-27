import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import UserService from "../../../services/UserService";
import logo from "../../assets/logo.png";

function SignUp() {
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUserName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: (data) => UserService.signUpUser(data),

    onError: (error) => {
      setErrorMessage(error?.response?.data?.message);
    },
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp");
      return;
    }
    const registerData = {
      username,
      email,
      password,
    };
    mutation.mutate(registerData);
  };
  const { data, isLoading, isSuccess } = mutation;

  useEffect(() => {
    if (isSuccess) {
      navigate("/login");
    }
  }, [isSuccess]);
  return (
    <>
      <div className="mt-30">
        <div className="w-[600px] mx-auto">
          <div className="p-10 border-3 border-[var(--primary-color)]/50  rounded-2xl z-10 relative bg-white">
            <div className="flex flex-col items-center">
              <div className="flex items-center space-x-2">
                <img className="h-[40px] rounded-xl" src={logo} alt="" />
                <span className="text-[var(--primary-color)] font-semibold text-2xl">
                  BeautyCare
                </span>
              </div>
              <div className="text-3xl font-bold mt-5 mb-3">Đăng ký</div>
              <div className="text-xl text-black/70">Tạo tài khoản mới</div>
            </div>
            <div className="mt-10">
              <form onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="name" className="text-xl font-semibold">
                    Tên tài khoản
                  </label>
                  <br />
                  <input
                    value={username}
                    onChange={(e) => setUserName(e.target.value)}
                    type="text"
                    name="name"
                    id="name"
                    placeholder="Nhập tên tài khoản..."
                    className="w-full p-2 border-2 border-[var(--primary-color)]/30 rounded-md outline-none my-3"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="text-xl font-semibold">
                    Email
                  </label>
                  <br />
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Nhập email..."
                    className="w-full p-2 border-2 border-[var(--primary-color)]/30 rounded-md outline-none my-3"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="text-xl font-semibold">
                    Mật khẩu
                  </label>
                  <br />
                  <div className="relative">
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type={isShowPassword ? "text" : "password"}
                      name="password"
                      id="password"
                      placeholder="Nhập mật khẩu..."
                      className="w-full p-2 border-2 border-[var(--primary-color)]/30 rounded-md outline-none my-3"
                    />
                    <i
                      onClick={() => setIsShowPassword(!isShowPassword)}
                      className={`text-[var(--primary-color)] fa-solid ${
                        isShowPassword ? "fa-eye" : "fa-eye-slash"
                      } absolute right-3 top-[26px] cursor-pointer`}
                    ></i>
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="text-xl font-semibold"
                  >
                    Xác nhận mật khẩu
                  </label>
                  <br />
                  <div className="relative">
                    <input
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      type={isShowPassword ? "text" : "password"}
                      name="password"
                      id="confirmPassword"
                      placeholder="Nhập lại mật khẩu..."
                      className="w-full p-2 border-2 border-[var(--primary-color)]/30 rounded-md outline-none my-3"
                    />
                    <i
                      onClick={() => setIsShowPassword(!isShowPassword)}
                      className={`text-[var(--primary-color)] fa-solid ${
                        isShowPassword ? "fa-eye" : "fa-eye-slash"
                      } absolute right-3 top-[26px] cursor-pointer`}
                    ></i>
                  </div>
                </div>
                {mutation.isError && (
                  <p className="text-red-500 mt-2">{errorMessage}</p>
                )}
                <button type="submit" className="w-full my-3">
                  Đăng ký
                </button>
              </form>
              <div className="text-center text-xl">
                <p>
                  Chưa có tài khoản?
                  <Link
                    to="/login"
                    className="text-[var(--primary-color)] mx-2"
                  >
                    Đăng nhập
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="fixed left-0 top-0 w-full h-full bg-black/30"></div>
      </div>
    </>
  );
}

export default SignUp;
