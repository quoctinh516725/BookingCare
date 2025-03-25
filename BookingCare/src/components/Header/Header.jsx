import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";
function Header() {
  const location = useLocation();
  const { username, email } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const handleLogin = () => {
    navigate("/login");
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
    <header className="w-full h-[65px] p-3 fixed top-0 w-full z-999  bg-[#ECEBEA]">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
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
                      } hover:[var(--primary-color)]`}
                    >
                      {item.name}{" "}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div
            className="rounded-[5px] h[30px] p-2 px-5 bg-white shadow-2xl cursor-pointer"
            onClick={!username ? handleLogin : undefined}
          >
            <div className="flex items-center space-x-2">
              <i className="fa-solid fa-user text-xl text-[var(--primary-color)]" />

              <span className="text-[13px] font-semibold">
                {username ? username : "Đăng nhập"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
