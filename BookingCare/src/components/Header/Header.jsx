import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import logo from "../../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect, useContext } from "react";
import { clearUser } from "../../redux/slices/userSlice";
import UserService from "../../../services/UserService";
import { MessageContext } from "../../contexts/MessageProvider.jsx";

function Header() {
  const location = useLocation();
  const { username, email, fullName, role } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const message = useContext(MessageContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  
  // Xử lý click bên ngoài để đóng dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && 
          !event.target.closest('.mobile-menu-button')) {
        setShowMobileMenu(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogin = () => {
    navigate("/login");
  };
  
  const handleLogout = async () => {
    try {
      // Gọi API logout
      await UserService.logoutUser();
      
      // Xóa thông tin người dùng trong Redux
      dispatch(clearUser());
      
      // Xóa token trong localStorage
      localStorage.removeItem('access_token');
      
      // Hiển thị thông báo thành công
      message.success('Đăng xuất thành công');
      
      // Đóng dropdown và mobile menu
      setShowDropdown(false);
      setShowMobileMenu(false);
      
      // Chuyển hướng về trang đăng nhập
      navigate('/');
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
      message.error('Có lỗi xảy ra khi đăng xuất');
    }
  };
  
  const handleProfile = () => {
    navigate("/profile");
    setShowDropdown(false);
    setShowMobileMenu(false);
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
    <header className="w-full h-[65px] fixed top-0 w-full z-50 bg-[#ECEBEA] shadow-sm">
      <div className="container mx-auto px-4 h-full">
        <div className="flex justify-between items-center h-full">
          <div className="flex items-center space-x-2">
            <img className="h-[40px] rounded-xl" src={logo} alt="BeautyCare Logo" />
            <span className="text-[var(--primary-color)] font-semibold text-xl md:text-2xl">
              BeautyCare
            </span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center">
            <ul className="flex justify-between space-x-5 font-medium">
              {page.map((item, index) => {
                return (
                  <li key={index}>
                    <Link
                      to={item.path}
                      className={`transition-colors duration-300 text-sm ${
                        item.path === location.pathname
                          ? "text-[var(--primary-color)]"
                          : "text-gray-700"
                      } hover:text-[var(--primary-color)]`}
                    >
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden flex items-center text-gray-700 mobile-menu-button"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label="Toggle mobile menu"
          >
            <i className={`fa-solid ${showMobileMenu ? 'fa-times' : 'fa-bars'} text-xl`}></i>
          </button>

          {/* User Account */}
          <div className="relative hidden md:block" ref={dropdownRef}>
            <div
              className="h-9 px-3 flex items-center cursor-pointer text-gray-700 hover:text-[var(--primary-color)]"
              onClick={username ? () => setShowDropdown(!showDropdown) : handleLogin}
            >
              <div className="flex items-center space-x-2">
                <i className="fa-solid fa-user text-[var(--primary-color)]" />
                <span className="text-sm whitespace-nowrap">
                  {username ? username : "Đăng nhập"}
                </span>
                {username && (
                  <i className={`fa-solid fa-chevron-${showDropdown ? 'up' : 'down'} text-xs`}></i>
                )}
              </div>
            </div>
            
            {/* Dropdown menu cho người dùng đã đăng nhập */}
            {showDropdown && username && (
              <div className="absolute right-0 mt-1 w-52 bg-white py-1 z-50 overflow-hidden shadow-sm rounded-md">
                <div className="px-3 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium truncate">{fullName || username}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{email}</p>
                  {role && <p className="text-xs text-[var(--primary-color)] mt-0.5">{role}</p>}
                </div>
                <div 
                  onClick={handleProfile}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:text-[var(--primary-color)] flex items-center cursor-pointer h-9"
                >
                  <i className="fa-solid fa-user-circle text-gray-500 mr-2 w-4"></i> 
                  <span>Tài khoản của tôi</span>
                </div>
                {role === "ADMIN" && (
                  <Link
                    to="/admin"
                    className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:text-[var(--primary-color)] flex items-center h-9"
                    onClick={() => setShowDropdown(false)}
                  >
                    <i className="fa-solid fa-cog text-gray-500 mr-2 w-4"></i> 
                    <span>Quản trị hệ thống</span>
                  </Link>
                )}
                <div className="border-t border-gray-100 my-1"></div>
                <div 
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm text-red-500 hover:text-red-600 flex items-center cursor-pointer h-9"
                >
                  <i className="fa-solid fa-sign-out-alt text-red-500 mr-2 w-4"></i> 
                  <span>Đăng xuất</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {showMobileMenu && (
        <div 
          ref={mobileMenuRef}
          className="md:hidden fixed top-[65px] left-0 w-full bg-white shadow-md z-40 border-t border-gray-100"
        >
          <div className="py-3 px-4">
            {/* Mobile Account Info */}
            {username ? (
              <div className="mb-3 pb-3 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--primary-color)] flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {fullName ? 
                        `${fullName.split(' ')[0]?.charAt(0) || ''}${fullName.split(' ')[1]?.charAt(0) || ''}` : 
                        username?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium truncate">{fullName || username}</p>
                    {email && <p className="text-xs text-gray-500 truncate">{email}</p>}
                    {role && <p className="text-xs text-[var(--primary-color)]">{role}</p>}
                  </div>
                </div>
                <div className="flex mt-3 space-x-2">
                  <button 
                    onClick={handleProfile}
                    className="flex-1 h-9 text-xs font-medium text-gray-700 border border-gray-200 rounded flex items-center justify-center"
                  >
                    <i className="fa-solid fa-user-circle mr-1"></i> Tài khoản
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="flex-1 h-9 text-xs font-medium text-red-500 border border-red-200 rounded flex items-center justify-center"
                  >
                    <i className="fa-solid fa-sign-out-alt mr-1"></i> Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-3 pb-3 border-b border-gray-100">
                <button 
                  onClick={handleLogin}
                  className="w-full h-9 bg-[var(--primary-color)] text-white rounded flex items-center justify-center"
                >
                  <i className="fa-solid fa-user mr-2"></i> Đăng nhập
                </button>
              </div>
            )}

            {/* Mobile Navigation */}
            <nav>
              <ul className="space-y-1">
                {page.map((item, index) => (
                  <li key={index}>
                    <Link
                      to={item.path}
                      onClick={() => setShowMobileMenu(false)}
                      className={`block py-2 text-sm ${
                        item.path === location.pathname
                          ? "text-[var(--primary-color)] font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
