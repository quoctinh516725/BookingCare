import React, { useState, useEffect } from "react";
import UserService from "../../../services/UserService";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "sonner";

function Booking() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const [formData, setFormData] = useState({
    name: user?.firstName ? `${user.firstName} ${user.lastName}` : "",
    phone: user?.phone || "",
    date: "",
    time: "",
    notes: "",
    specialistId: ""
  });
  const [selectedServices, setSelectedServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Lấy dữ liệu từ API khi component được render
  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataLoading(true);
        // Lấy danh sách dịch vụ
        const servicesData = await UserService.getServices();
        setServices(servicesData.map(service => ({
          id: service.id,
          name: service.name,
          desc: service.description,
          duration: service.duration,
          price: `${new Intl.NumberFormat('vi-VN').format(service.price)}₫`,
          priceValue: service.price
        })));

        // Lấy danh sách chuyên viên
        const staffData = await UserService.getStaff();
        setSpecialists(staffData.map(staff => ({
          id: staff.id,
          name: `${staff.firstName} ${staff.lastName}`,
          desc: staff.description || `Chuyên viên chăm sóc da với nhiều năm kinh nghiệm.`
        })));

      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        toast.error("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleServiceChange = (e, serviceId) => {
    if (e.target.checked) {
      setSelectedServices([...selectedServices, serviceId]);
    } else {
      setSelectedServices(selectedServices.filter(id => id !== serviceId));
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Vui lòng đăng nhập để đặt lịch");
      navigate("/login");
      return;
    }

    if (selectedServices.length === 0) {
      toast.error("Vui lòng chọn ít nhất một dịch vụ");
      return;
    }

    if (!formData.date || !formData.time) {
      toast.error("Vui lòng chọn ngày và giờ đặt lịch");
      return;
    }

    const timeSelect = document.getElementById("time");
    const selectedTime = timeSelect.options[timeSelect.selectedIndex].value;

    // Tính tổng chi phí dựa trên các dịch vụ đã chọn
    const totalPrice = selectedServices.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return total + (service ? service.priceValue : 0);
    }, 0);

    setLoading(true);

    try {
      const bookingData = {
        customerId: user.id,
        serviceIds: selectedServices,
        bookingDate: formData.date,
        startTime: selectedTime,
        notes: formData.notes,
        totalPrice: totalPrice
      };

      // Chỉ thêm staffId nếu người dùng chọn chuyên viên
      if (formData.specialistId) {
        bookingData.staffId = formData.specialistId;
      }

      await UserService.bookingUser(bookingData);
      
      // Hiển thị thông báo thành công với nút xác nhận
      toast.success(
        <div>
          <p>Đặt lịch thành công!</p>
          <div className="mt-2 flex justify-between">
            <button
              className="px-3 py-1 bg-[var(--primary-color)] text-white rounded text-xs"
              onClick={() => {
                toast.dismiss();
                navigate("/profile");
              }}
            >
              Xem lịch hẹn
            </button>
            <button
              className="px-3 py-1 bg-gray-200 rounded text-xs"
              onClick={() => toast.dismiss()}
            >
              Ở lại trang
            </button>
          </div>
        </div>,
        {
          autoClose: false,
          closeButton: true,
          position: "top-center",
          className: "booking-success-toast",
        }
      );
      
      // Reset form sau khi đặt lịch thành công
      setSelectedServices([]);
      setFormData({
        ...formData,
        date: "",
        time: "",
        specialistId: "",
        notes: ""
      });
      
    } catch (error) {
      console.error("Lỗi khi đặt lịch:", error);
      
      if (error.response?.data?.message) {
        // Hiển thị thông báo lỗi từ server
        if (error.response.data.message.includes("time slot is not available")) {
          toast.error("Khung giờ này đã có lịch hẹn. Vui lòng chọn thời gian khác hoặc chuyên viên khác.");
        } else if (error.response.data.message.includes("service not completed")) {
          toast.error("Chuyên viên này đang có lịch hẹn chưa hoàn thành trong khung giờ này. Vui lòng chọn thời gian khác hoặc chuyên viên khác.");
        } else if (error.response.data.message.includes("already have a booking")) {
          toast.error("Bạn đã có lịch hẹn trong khung giờ này. Vui lòng chọn thời gian khác.");
        } else {
          toast.error(error.response.data.message);
        }
      } else {
        toast.error("Đã xảy ra lỗi khi đặt lịch. Vui lòng thử lại sau.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Hiển thị trạng thái loading khi đang lấy dữ liệu
  if (dataLoading) {
    return (
      <div className="my-30">
        <div className="w-[900px] mx-auto p-8 border-3 border-[var(--primary-color)]/50 rounded-2xl">
          <h2 className="text-3xl font-bold my-3 text-center">
            Đặt Lịch Dịch Vụ
          </h2>
          <div className="flex flex-col items-center justify-center p-10">
            <div className="w-12 h-12 border-4 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-lg">Đang tải thông tin dịch vụ...</p>
          </div>
        </div>
      </div>
    );
  }

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
                      <span>{service.duration} Phút</span>
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
            disabled={user?.firstName}
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
            disabled={user?.phone}
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
                min={new Date().toISOString().split('T')[0]}
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
                <option value="">Chọn giờ</option>
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
            <option value="">Chọn chuyên viên</option>
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
            <button 
              type="submit" 
              className="w-1/2 mt-5 bg-[var(--primary-color)] text-white py-2 rounded-md hover:bg-[var(--primary-color-dark)] disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Đang xử lý..." : "Đặt lịch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Booking;
