import serviceImg1 from "../../assets/services/serviceImg1.jpg";

function CardService() {
  return (
    <div className="w-[470px] rounded-[10px] overflow-hidden bg-white border border-black/10 hover:shadow-xl hover:border-transparent group">
      <div className="overflow-hidden">
          <img
            className="w-full h-[245px] object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out"
            src={serviceImg1}
            alt=""
          />
      </div>
      <div className="p-6">
        <h4 className="font-semibold text-2xl">Chăm sóc da cơ bản</h4>
        <div className="flex justify-between items-center">
          <span className="font-semibold text-[var(--primary-color)]">
            250.000 ₫
          </span>
          <span className="space-x-2 text-black/60">
            <i className="fa-regular fa-clock"></i>
            <span>60 Phút</span>
          </span>
        </div>
        <p className="mt-5 mb-4">
          Làm sạch, tẩy tế bào chết và dưỡng ẩm chuyên sâu
        </p>
        <button className="text-white font-semibold w-full ">
          Xem chi tiết
        </button>
      </div>
    </div>
  );
}

export default CardService;
