import { useState } from "react";
import { useSelector } from "react-redux";
import UserService from "../../../services/UserService";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

function Booking() {
  const navigate = useNavigate();
  const { id: userId } = useSelector((state) => state.user);
  
  // Thêm state để lưu trữ dữ liệu form
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    date: "",
    time: "",
    specialistId: "",
    selectedServices: [],
    notes: ""
  });
  
  // Hàm xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Xử lý thay đổi checkbox dịch vụ
  const handleServiceChange = (e, serviceId) => {
    const { checked } = e.target;
    if (checked) {
      setFormData({
        ...formData,
        selectedServices: [...formData.selectedServices, serviceId]
      });
    } else {
      setFormData({
        ...formData,
        selectedServices: formData.selectedServices.filter(id => id !== serviceId)
      });
    }
  };
  
  // Xử lý đặt lịch
  const handleBooking = async (e) => {
    e.preventDefault();
    
    if (!userId) {
      toast.error("Vui lòng đăng nhập để đặt lịch");
      navigate("/login");
      return;
    }
    
    if (formData.selectedServices.length === 0) {
      toast.error("Vui lòng chọn ít nhất một dịch vụ");
      return;
    }
    
    if (!formData.date || !formData.time) {
      toast.error("Vui lòng chọn ngày và giờ hẹn");
      return;
    }
    
    // Chuyển đổi định dạng dữ liệu để gửi đến API
    const bookingData = {
      customerId: userId,
      staffId: formData.specialistId || null, // Gửi null nếu không chọn nhân viên
      serviceIds: formData.selectedServices,
      bookingDate: formData.date,
      startTime: formData.time,
      notes: formData.notes
    };
    
    try {
      const response = await UserService.bookingUser(bookingData);
      toast.success("Đặt lịch thành công!");
      navigate("/profile"); // Chuyển hướng đến trang profile sau khi đặt lịch
    } catch (error) {
      console.error("Lỗi khi đặt lịch:", error);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Đã xảy ra lỗi khi đặt lịch, vui lòng thử lại sau");
      }
    }
  };

  const services = [
    {
      id: "s1",
      name: "Chăm sóc da cơ bản",
      desc: "Làm sạch, tẩy tế bào chết và dưỡng ẩm chuyên sâu",
      time: 60,
      price: "450.000₫",
    },
    {
      id: "s2",
      name: "Trị mụn chuyên sâu",
      desc: "Điều trị mụn, thâm nám và các vấn đề da khác",
      time: 90,
      price: "650.000₫",
    },
    {
      id: "s3",
      name: "Trẻ hóa da",
      desc: "Sử dụng công nghệ hiện đại giúp làn da trẻ trung hơn",
      time: 120,
      price: "850.000₫",
    },
    {
      id: "s4",
      name: "Massage mặt",
      desc: "Kỹ thuật massage thư giãn và làm săn chắc da mặt",
      time: 45,
      price: "350.000₫",
    },
    {
      id: "s5",
      name: "Tẩy trang chuyên sâu",
      desc: "Làm sạch sâu và loại bỏ mọi bụi bẩn, tạp chất trên da",
      time: 30,
      price: "250.000₫",
    },
  ];
  
  const specialists = [
    {
      id: "a1b2c3d4-e5f6-11ec-8000-000000000002",
      name: "Nguyễn Thị Lan",
      desc: "Chuyên gia da liễu với hơn 10 năm kinh nghiệm trong điều trị mụn và nám.",
    },
    {
      id: "a1b2c3d4-e5f6-11ec-8000-000000000003",
      name: "Trần Minh Khoa",
      desc: "Bác sĩ chuyên khoa thẩm mỹ, chuyên về trẻ hóa da và chăm sóc sắc đẹp.",
    },
    {
      id: "staff3",
      name: "Lê Thu Hằng",
      desc: "Chuyên viên massage trị liệu giúp thư giãn và cải thiện tuần hoàn máu.",
    },
    {
      id: "staff4",
      name: "Phạm Văn Dũng",
      desc: "Chuyên gia tư vấn chăm sóc da, cung cấp giải pháp cá nhân hóa cho từng khách hàng.",
    },
    {
      id: "staff5",
      name: "Đỗ Mỹ Linh",
      desc: "Chuyên gia về liệu pháp thiên nhiên, sử dụng các sản phẩm hữu cơ trong chăm sóc da.",
    },
  ];

  return (
    <div className="my-30">
      <div className="w-[900px] mx-auto">
        <form onSubmit={handleBooking} className="p-8 border-3 border-[var(--primary-color)]/50 rounded-2xl">
          <h2 className="text-3xl font-bold my-3 text-center">
            Đặt Lịch Dịch Vụ
          </h2>
          <p className="text-xl font-semibold my-4">Dịch vụ</p>
          <div className="p-4 border border-black/10 rounded-2xl">
            {services.map((service, index) => {
              return (
                <div key={index} className="flex items-center mb-5">
                  <input
                    type="checkbox"
                    name="service"
                    id={`service-${service.id}`}
                    className="accent-[var(--primary-color)] w-4 h-4 mx-4 cursor-pointer"
                    onChange={(e) => handleServiceChange(e, service.id)}
                  />
                  <div className="mr-auto">
                    <h5 className="font-semibold">{service.name}</h5>
                    <p className="text-black/50">{service.desc}</p>
                    <div className="space-x-1 text-black/50">
                      <i className="fa-regular fa-clock"></i>
                      <span>{service.time} Phút</span>
                    </div>
                  </div>
                  <span className="font-semibold">{service.price}</span>
                </div>
              );
            })}
          </div>
          <p className="text-xl font-semibold mt-5">Họ và tên</p>
          <input
            type="text"
            name="name"
            id="name"
            placeholder="Nhập họ và tên..."
            className="w-full p-2 border-2 border-black/10 rounded-md outline-none my-3"
            value={formData.name}
            onChange={handleInputChange}
          />
          <p className="text-xl font-semibold mt-3">Số điện thoại</p>
          <input
            type="text"
            name="phone"
            id="phone"
            placeholder="Nhập số điện thoại..."
            className="w-full p-2 border-2 border-black/10 rounded-md outline-none my-3"
            value={formData.phone}
            onChange={handleInputChange}
          />
          <div className="flex space-x-5 mt-3">
            <div className="w-1/2">
              <p className="text-xl font-semibold">Ngày</p>
              <input
                type="date"
                name="date"
                id="date"
                className="w-full p-2 border-2 border-black/10 rounded-md outline-none my-3 cursor-pointer"
                onFocus={(e) => e.target.showPicker()}
                value={formData.date}
                onChange={handleInputChange}
              />
            </div>
            <div className="w-1/2">
              <p className="text-xl font-semibold">Giờ</p>
              <select
                name="time"
                id="time"
                className="w-full p-2 border-2 border-black/10 rounded-md outline-none my-3 cursor-pointer"
                value={formData.time}
                onChange={handleInputChange}
              >
                <option value="" disabled>
                  Chọn giờ
                </option>
                <option value="07:00">07:00</option>
                <option value="07:30">07:30</option>
                <option value="08:00">08:00</option>
                <option value="08:30">08:30</option>
                <option value="09:00">09:00</option>
                <option value="09:30">09:30</option>
                <option value="10:00">10:00</option>
                <option value="10:30">10:30</option>
                <option value="11:00">11:00</option>
                <option value="11:30">11:30</option>
                <option value="12:00">12:00</option>
                <option value="12:30">12:30</option>
                <option value="13:00">13:00</option>
                <option value="13:30">13:30</option>
                <option value="14:00">14:00</option>
                <option value="14:30">14:30</option>
                <option value="15:00">15:00</option>
                <option value="15:30">15:30</option>
                <option value="16:00">16:00</option>
                <option value="16:30">16:30</option>
                <option value="17:00">17:00</option>
                <option value="17:30">17:30</option>
                <option value="18:00">18:00</option>
              </select>
            </div>
          </div>
          <p className="text-xl font-semibold mt-3">Chuyên viên</p>
          <select
            name="specialistId"
            id="specialistId"
            className="w-full p-2 border-2 border-black/10 rounded-md outline-none my-3"
            value={formData.specialistId}
            onChange={handleInputChange}
          >
            <option value="">
              Chọn chuyên viên
            </option>
            {specialists.map((specialist, index) => {
              return (
                <option value={specialist.id} key={index}>
                  {specialist.name}
                </option>
              );
            })}
          </select>
          
          <p className="text-xl font-semibold mt-3">Ghi chú</p>
          <textarea
            name="notes"
            id="notes"
            placeholder="Nhập ghi chú nếu có..."
            className="w-full p-2 border-2 border-black/10 rounded-md outline-none my-3"
            rows={3}
            value={formData.notes}
            onChange={handleInputChange}
          ></textarea>

          <div className="flex justify-center">
            <button type="submit" className="w-1/2 mt-5">Đặt lịch</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Booking;
