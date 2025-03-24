import { useState } from "react";
import CardService from "../../components/Card/CardService";
import Filter from "../../components/Filter";
function Service() {
  const serviceType = [
    "Tất cả",
    "Chăm sóc da",
    "Điều trị",
    "Thư giãn",
    "Trẻ hóa",
    "Làm đẹp",
    "Khác",
  ];
  return (
    <div className=" flex flex-col mt-[100px]">
      <div className="container mx-auto">
        <div className="">
          <Filter
            serviceType={serviceType}
            title="Dịch Vụ Của Chúng Tôi "
            desc="Khám phá các dịch vụ chăm sóc da chuyên nghiệp được thiết kế riêng cho làn da của bạn"
          />
          <div className="flex justify-between flex-wrap my-10">
            <CardService />
            <CardService />
            <CardService />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Service;
