import { Link, useNavigate } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import logo from "../../assets/logo.png";
import UserService from "../../services/UserService";
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
  const { data, isLoading, isSuccess } = mutation;

  useEffect(() => {
    if (isSuccess) {
      navigate("/");
      message.success("Đăng nhập thành công");
      const token = data?.data?.token;
      localStorage.setItem("access_token", JSON.stringify(token));
      if (token) {
        const decoded = jwtDecode(token);
        if (decoded?.userId) {
          handleGetDetailsUser(decoded?.userId, token);
        }
      }
    }
  }, [isSuccess]);
  const handleGetDetailsUser = async (id, token) => {
    try {
      const response = await UserService.getDetailUser(id, token);
      dispatch(setUser(response?.data, token));
    } catch (error) {
      console.log("Error get details user", error);
    }
  };
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
              <div className="text-3xl font-bold mt-5 mb-3">Đăng nhập</div>
              <div className="text-xl text-black/70">
                Nhập thông tin tài khoản của bạn
              </div>
            </div>
            <div className="mt-10">
              <form onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="username" className="text-xl font-semibold">
                    Tên tài khoản
                  </label>{" "}
                  <br />
                  <input
                    value={username}
                    onChange={(e) => setUserName(e.target.value)}
                    type="text"
                    name="username"
                    id="username"
                    placeholder="Nhập tên tài khoản..."
                    className="w-full p-2 border-2 border-[var(--primary-color)]/30 rounded-md outline-none my-3"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="text-xl font-semibold">
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
                <button type="submit" className="w-full my-3">
                  Đăng nhập
                </button>
              </form>
              <div className="text-center text-xl">
                <p>
                  Chưa có tài khoản?
                  <Link
                    to="/sign-up"
                    className="text-[var(--primary-color)] mx-2"
                  >
                    Đăng ký
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

export default Login;
