import Filter from "../../components/Filter";
import CardSpecialist from "../../components/Card/CardSpecialist";
function Specialist() {
  const specialistType = [
    "Tất cả",
    "Bác sĩ da liễu",
    "Chuyên gia điều trị mụn",
    "Chuyên gia trị liệu",
    "Chuyên gia chăm sóc da",
    "Chuyên gia trẻ hóa da",
  ];
  return (
    <div className=" flex flex-col mt-[100px]">
      <div className="container mx-auto">
        <div className="">
          <Filter
            serviceType={specialistType}
            title="Đội Ngũ Chuyên Viên"
            desc="Gặp gỡ đội ngũ chuyên viên giàu kinh nghiệm của chúng tôi, những người sẽ chăm sóc làn da của bạn"
          />
          <div className="flex justify-between flex-wrap my-10">
            <CardSpecialist />
            <CardSpecialist />
            <CardSpecialist />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Specialist;
