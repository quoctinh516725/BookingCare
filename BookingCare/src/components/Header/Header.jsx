//Xử lý dropdown user
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { logout } from "../../redux/slices/userSlice";
import { useDispatch } from "react-redux";
import UserService from "../../../services/UserService";
function Header() {
  const location = useLocation();
  const menuRef = useRef();
  const showMenuRef = useRef();
  const dispatch = useDispatch();
  const { username, email, role } = useSelector((state) => state.user);
  const [isShowMenu, setIsShowMenu] = useState(false);

  const navigate = useNavigate();
  const handleLogin = () => {
    navigate("/login");
  };
  const handleShowMenu = () => {
    setIsShowMenu(!isShowMenu);
  };
  window.addEventListener("click", (e) => {
    if (
      !menuRef.current?.contains(e.target) &&
      !showMenuRef.current?.contains(e.target)
    ) {
      setIsShowMenu(false);
    }
  });
  const handleLogout = async () => {
    await UserService.logoutUser();
    dispatch(logout());
    localStorage.removeItem("access_token");
    setIsShowMenu(false);
    navigate("/");
  };
  const page = [
    {
      name: "Trang chủ",
      path: "/",
    },
    {
      name: "Dịch vụ",
      path: "/service",
    },
    {
      name: "Chuyên viên",
      path: "/specialist",
    },
    {
      name: "Đặt lịch",
      path: "/booking",
    },
    {
      name: "Blog",
      path: "/blog",
    },
    {
      name: "Trắc nghiệm da",
      path: "/test",
    },
  ];
  return (
    <header className=" w-full h-[65px] p-3 fixed top-0 w-full z-999  bg-[#ECEBEA]">
      <div className="container mx-auto">
        <div className="relative flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img className="h-[40px] rounded-xl" src={logo} alt="" />
            <span className="text-[var(--primary-color)] font-semibold text-2xl">
              BeautyCare
            </span>
          </div>
          <nav className="flex items-center">
            <ul className="flex justify-between space-x-5 font-semibold">
              {page.map((item, index) => {
                return (
                  <li key={index}>
                    <Link
                      to={item.path}
                      className={`transition-colors duration-300 ${
                        item.path === location.pathname
                          ? "text-[var(--primary-color)]"
                          : ""
                      } hover:text-[var(--primary-color)]`}
                    >
                      {item.name}{" "}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div
            ref={showMenuRef}
            className="rounded-[5px] h[30px] p-2 px-5 bg-white shadow-2xl cursor-pointer"
            onClick={!username ? handleLogin : handleShowMenu}
          >
            <div className=" flex items-center space-x-2">
              <i
                className={`fa-solid ${
                  role === "ADMIN" ? "fa-shield-halved" : "fa-user"
                } text-xl text-[var(--primary-color)]`}
              />
              <span className="text-[13px] font-semibold">
                {username ? username : "Đăng nhập"}
              </span>
            </div>
          </div>
          {isShowMenu && (
            <div
              ref={menuRef}
              className="absolute bottom-[-210px] right-0 min-w-[200px] p-4 bg-white  rounded-lg"
            >
              <ul className="flex flex-col gap-2 cursor-pointer">
                <li className="font-semibold text-xl border-b  border-black/10 cursor-auto">
                  Tài khoản
                </li>
                <li className="hover:bg-gray-100 p-2 rounded-md">Tổng quan</li>
                <li className="hover:bg-gray-100 p-2 rounded-md">
                  <Link to="/profile">Quản lý thông tin</Link>
                </li>
                <li
                  onClick={handleLogout}
                  className=" border-t border-black/10 p-2 hover:bg-gray-100 rounded-md"
                >
                  <i className="fa-solid fa-right-from-bracket mr-2"></i>
                  Đăng xuất
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
