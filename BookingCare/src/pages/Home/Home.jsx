import Background from "../../assets/home/BackgroundHome.avif";
import CardService from "../../components/Card/CardService";
import CardSpecialist from "../../components/Card/CardSpecialist";
import CardBlog from "../../components/Card/CardBlog";

import testImg from "../../assets/home/testImg.webp";
function Home() {
  return (
      <div className=" flex flex-col mt-[60px]">
        <div className="w-full h-[600px] relative  ">
          <img
            src={Background}
            alt="Background"
            className="w-full h-full bg-cover object-cover"
          />
          <div className="w-full h-full absolute left-0 top-0 bg-black/55"></div>
          <div className="absolute max-w-[850px] top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] text-white">
            <h1 className="text-6xl font-bold font-arial whitespace-nowrap">
              Chăm Sóc Da Chuyên Nghiệp
            </h1>
            <p className="text-3xl mt-5">
              Khám phá các dịch vụ chăm sóc da cao cấp và được tư vấn bởi các
              chuyên gia hàng đầu
            </p>
            <button className="mt-5">
              <i className="fa-solid fa-calendar-days"></i>{" "}
              <span>Đặt lịch ngay</span>
            </button>
          </div>
        </div>
        <div className="container mx-auto mt-15">
          <div className="text-center">
            <h2 className="text-4xl font-bold uppercase">
              Dịch Vụ Của Chúng Tôi
            </h2>
            <p className="m-4 mb-10 text-xl text-[#565F6C]">
              Khám phá các dịch vụ chăm sóc da chuyên nghiệp
            </p>
          </div>
          <div className="flex justify-between flex-wrap ">
            <CardService />
            <CardService />
            <CardService />
          </div>
          <div className="flex justify-center m-10">
            <button className="p-4">Xem tất cả dịch vụ</button>
          </div>
        </div>
        <div className="container mx-auto my-10">
          <div className="text-center">
            <h2 className="text-4xl font-bold uppercase">
              Đội Ngũ Chuyên Viên
            </h2>
            <p className="m-4 mb-10 text-xl text-[#565F6C]">
              Đội ngũ chuyên viên giàu kinh nghiệm của chúng tôi luôn sẵn sàng
              tư vấn và chăm sóc làn da của bạn với những dịch vụ chất lượng cao
            </p>
          </div>
          <div className="flex justify-between flex-wrap ">
            <CardSpecialist />
            <CardSpecialist />
            <CardSpecialist />
          </div>
          <div className="flex justify-center m-10">
            {" "}
            <button className="p-4">Xem tất cả chuyên viên</button>
          </div>
        </div>
        <div className="my-10">
          <div className=" bg-[#fde9f3]">
            <div className="container mx-auto flex py-20">
              <div className="w-[50%] py-10 pr-20">
                <h2 className="text-4xl font-bold uppercase">
                  Khám phá loại da của bạn
                </h2>
                <p className="my-10 text-xl">
                  Sử dụng công cụ trắc nghiệm da miễn phí của chúng tôi để nhận
                  diện chính xác loại da và nhận được gợi ý về các dịch vụ và
                  sản phẩm phù hợp nhất.
                </p>
                <div className="flex text-xl items-center space-x-4 my-5">
                  <i className="fa-regular fa-circle-check text-3xl text-[var(--primary-color)]"></i>{" "}
                  <span> Xác định chính xác loại da của bạn</span>
                </div>
                <div className="flex text-xl items-center space-x-4 my-5">
                  <i className="fa-regular fa-circle-check text-3xl  text-[var(--primary-color)]"></i>{" "}
                  <span> Nhận gợi ý dịch vụ phù hợp</span>
                </div>
                <div className="flex text-xl items-center space-x-4 my-5">
                  <i className="fa-regular fa-circle-check text-3xl  text-[var(--primary-color)]"></i>{" "}
                  <span>Tư vấn sản phẩm chăm sóc cá nhân hóa</span>
                </div>
                <div className="flex text-xl items-center space-x-4 my-5">
                  <i className="fa-regular fa-circle-check text-3xl  text-[var(--primary-color)]"></i>{" "}
                  <span> Hoàn toàn miễn phí, chỉ mất 2 phút</span>
                </div>
                <button className="mt-10">Làm trắc nghiệm miễn phí</button>
              </div>
              <div className="w-[50%]">
                <div className="overflow-hidden rounded-2xl">
                  <img
                    className="hover:scale-110 transition-transform duration-500 ease-in-out"
                    src={testImg}
                    alt=""
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto my-10">
          <div className="text-center">
            <h2 className="text-4xl font-bold uppercase">Bài Viết Nổi Bật</h2>
            <p className="m-4 mb-10 text-xl text-[#565F6C]">
              Chia sẻ kiến thức và bí quyết chăm sóc da từ các chuyên gia hàng
              đầu
            </p>
          </div>
          <div className="flex justify-between flex-wrap ">
            <CardBlog />
            <CardBlog />
            <CardBlog />
          </div>
          <div className="flex justify-center m-10">
            {" "}
            <button className="p-4">Xem tất cả bài viết</button>
          </div>
        </div>
      </div>
  );
}

export default Home;
