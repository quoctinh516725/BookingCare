import blogImg1 from "../../assets/blog/blogImg1.avif";

function CardService() {
  return (
    <div className="w-[470px] rounded-[10px] overflow-hidden bg-white border border-black/10 hover:shadow-xl hover:border-transparent group">
      <div className="w-full h-[350px] overflow-hidden">
        <img
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out"
          src={blogImg1}
          alt=""
        />
      </div>
      <div className="p-6">
        <div className="flex items-center space-x-2 text-black/50">
          <i className="fa-solid fa-calendar-days"></i>
          <span>15/06/2023</span>
          <i className="fa-solid fa-circle text-[5px] text-black/30 "></i>
          <span>Thu Hà</span>
        </div>
        <h4 className="font-semibold text-2xl mb-5">
          5 bước chăm sóc da cơ bản mỗi ngày
        </h4>
        <span className=" text-black/60">
          Khám phá quy trình 5 bước đơn giản giúp làn da của bạn luôn khỏe mạnh
          và rạng rỡ mỗi ngày.
        </span>
        <button className=" mt-3 w-full">Xem chi tiết</button>
      </div>
    </div>
  );
}

export default CardService;
