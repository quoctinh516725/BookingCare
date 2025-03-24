import specialistImg1 from "../../assets/specialist/specialistImg1.avif";

function CardService() {
  return (
    <div className="w-[470px] rounded-[10px] overflow-hidden bg-white border border-black/10 hover:shadow-xl hover:border-transparent group">
      <div className="w-full h-[350px] overflow-hidden">
        <img
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out"
          src={specialistImg1}
          alt=""
        />
      </div>
      <div className="p-6">
        <div className="flex flex-col justify-between items-center">
          <h4 className="font-semibold text-3xl mb-5">Nguyễn Thị Mai</h4>
          <span className="font-semibold text-[var(--primary-color)]">
            Chuyên gia điều trị mụn
          </span>
          <span className="space-x-2 text-black/60">10 năm kinh nghiệm</span>{" "}
          <button className=" mt-3 w-full">Xem chi tiết</button>
        </div>
      </div>
    </div>
  );
}

export default CardService;
