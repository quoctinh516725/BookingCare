function Footer() {
  return (
    <div>
      <footer>
        <div className="w-full bg-[#ECEBEA] border border-y border-black/10">
          <div className="container mx-auto">
            <div className="flex justify-between p-20 space-x-5">
              <div className="flex-1">
                <h5 className="text-xl text-[var(--primary-color)] font-black">
                  BeautyCare
                </h5>
                <p className="my-3 text-black/70">
                  Chúng tôi cung cấp các dịch vụ chăm sóc da chuyên nghiệp, được
                  thực hiện bởi đội ngũ chuyên viên giàu kinh nghiệm và trang
                  thiết bị hiện đại.
                </p>
                <div className="flex space-x-3">
                  <i className="fa-brands fa-facebook-f hover:text-[var(--primary-color)] text-gray-500"></i>
                  <i className="fa-brands fa-instagram hover:text-[var(--primary-color)] text-gray-500"></i>
                  <i className="fa-brands fa-twitter hover:text-[var(--primary-color)] text-gray-500"></i>
                </div>
              </div>
              <div className="flex-1">
                <h5 className="text-xl  font-black">Liên kết nhanh</h5>
                <ul className="text-black/70">
                  <li>Dịch vụ</li>
                  <li>Chuyên viên</li>
                  <li>Blog</li>
                  <li>Trắc nghiệm da</li>
                  <li>Đặt lịch</li>
                </ul>
              </div>
              <div className="flex-1">
                <h5 className="text-xl  font-black">Dịch vụ</h5>
                <ul className="text-black/70">
                  <li>Chăm sóc da cơ bản</li>
                  <li>Trị liệu chuyên sâu</li>
                  <li>Massage và thư giãn</li>
                  <li>Điều trị nám và tàn nhang</li>
                  <li>Trẻ hóa da</li>
                </ul>
              </div>
              <div className="flex-1">
                <h5 className="text-xl  font-black">Liên hệ</h5>
                <ul className="text-black/70">
                  <li>123 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh</li>
                  <li>0312374567</li>
                  <li>info@beautycare.com</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Footer;
