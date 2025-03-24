import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";

function SignUp() {
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
              <label for="name" className="text-xl font-semibold">
                Họ và tên
              </label>
              <br />
              <input
                type="text"
                name="name"
                id="name"
                placeholder="Nhập họ và tên..."
                className="w-full p-2 border-2 border-[var(--primary-color)]/30 rounded-md outline-none my-3"
              />
              <label for="email" className="text-xl font-semibold">
                Email
              </label>
              <br />
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Nhập email..."
                className="w-full p-2 border-2 border-[var(--primary-color)]/30 rounded-md outline-none my-3"
              />
              <label for="email" className="text-xl font-semibold">
                Mật khẩu
              </label>
              <br />
              <input
                type="password"
                name="password"
                id="password"
                placeholder="Nhập mật khẩu..."
                className="w-full p-2 border-2 border-[var(--primary-color)]/30 rounded-md outline-none my-3"
              />
              <label for="email" className="text-xl font-semibold">
                Xác nhận mật khẩu
              </label>
              <br />
              <input
                type="password"
                name="password"
                id="password"
                placeholder="Nhập lại mật khẩu..."
                className="w-full p-2 border-2 border-[var(--primary-color)]/30 rounded-md outline-none my-3"
              />
              <button className="w-full my-3">Đăng ký</button>
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
