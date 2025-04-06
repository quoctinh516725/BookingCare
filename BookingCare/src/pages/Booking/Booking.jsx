import React, { useState, useEffect, useContext } from "react";
import UserService from "../../../services/UserService";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { MessageContext } from "../../contexts/MessageProvider";
import { useMutation } from "@tanstack/react-query";
function Booking() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  console.log(user.access_token === null);

  const message = useContext(MessageContext);
  const [formData, setFormData] = useState({
    name: user?.firstName ? `${user.firstName} ${user.lastName}` : "",
    phone: user?.phone || "",
    date: "",
    time: "",
    notes: "",
    specialistId: "",
  });
  const [selectedServices, setSelectedServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Thêm state mới để kiểm soát trạng thái giờ đã đặt
  const [bookedTimeSlots, setBookedTimeSlots] = useState([]);

  // Lấy dữ liệu từ API khi component được render
  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataLoading(true);
        // Lấy danh sách dịch vụ
        const servicesData = await UserService.getServices();
        setServices(
          servicesData.map((service) => ({
            id: service.id,
            name: service.name,
            desc: service.description,
            duration: service.duration,
            price: `${new Intl.NumberFormat("vi-VN").format(service.price)}₫`,
            priceValue: service.price,
          }))
        );

        // Lấy danh sách chuyên viên
        const staffData = await UserService.getStaff();
        setSpecialists(
          staffData.map((staff) => ({
            id: staff.id,
            name: `${staff.firstName} ${staff.lastName}`,
            desc:
              staff.description ||
              `Chuyên viên chăm sóc da với nhiều năm kinh nghiệm.`,
          }))
        );
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
        message.error("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, []);

  // Cập nhật hàm lấy các khung giờ đã đặt với xử lý lỗi tốt hơn
  const fetchBookedTimeSlots = async () => {
    if (!formData.date || !formData.specialistId) {
      console.log(
        "Missing required data for fetchBookedTimeSlots. Date or specialistId is undefined."
      );
      setBookedTimeSlots([]);
      return;
    }

    try {
      console.log(
        `Fetching booked slots - Specialist: ${formData.specialistId}, Date: ${formData.date}`
      );

      const bookedSlots = await UserService.getBookedTimeSlots(
        formData.specialistId,
        formData.date
      );

      console.log("Booked slots received:", bookedSlots);
      setBookedTimeSlots(Array.isArray(bookedSlots) ? bookedSlots : []);

      // Kiểm tra nếu khung giờ hiện tại đã được đặt
      if (formData.time && bookedSlots.includes(formData.time)) {
        console.log(`Selected time ${formData.time} is already booked`);
        message.warning(
          "Khung giờ này đã được đặt. Vui lòng chọn thời gian khác."
        );
      }
    } catch (error) {
      console.error("Failed to fetch booked slots:", error);
      message.error(
        "Không thể tải danh sách khung giờ đã đặt. Đang hiển thị tất cả khung giờ."
      );
      setBookedTimeSlots([]);
    }
  };

  // Cập nhật fetchBookedTimeSlots khi thay đổi ngày hoặc nhân viên
  useEffect(() => {
    fetchBookedTimeSlots();
  }, [formData.date, formData.specialistId]);

  // Cập nhật kiểm tra khung giờ có bị chiếm không
  const isTimeSlotBooked = (timeSlot) => {
    return bookedTimeSlots.includes(timeSlot);
  };

  // Cập nhật handleBooking để hiển thị thông báo chi tiết hơn
  const handleBooking = async (e) => {
    e.preventDefault();

    if (!user?.access_token) {
      message.error("Vui lòng đăng nhập để đặt lịch");
      navigate("/login");
      return;
    }

    if (selectedServices.length === 0) {
      message.error("Vui lòng chọn ít nhất một dịch vụ");
      return;
    }

    if (!formData.date || !formData.time) {
      message.error("Vui lòng chọn ngày và giờ đặt lịch");
      return;
    }

    if (!formData.specialistId) {
      message.warning("Vui lòng chọn chuyên viên cho dịch vụ của bạn");
      return;
    }

    processBooking();
  };

  // Tách phần xử lý đặt lịch thành hàm riêng để tái sử dụng
  const processBooking = async () => {
    setLoading(true);

    try {
      // Tính tổng chi phí dựa trên các dịch vụ đã chọn
      const totalPrice = selectedServices.reduce((total, serviceId) => {
        const service = services.find((s) => s.id === serviceId);
        return total + (service ? service.priceValue : 0);
      }, 0);

      const bookingData = {
        customerId: user.id,
        serviceIds: selectedServices,
        bookingDate: formData.date,
        startTime: formData.time,
        notes: formData.notes,
        totalPrice: totalPrice,
        staffId: formData.specialistId, // Luôn gửi staffId vì đã bắt buộc chọn
      };

      console.log("Gửi dữ liệu đặt lịch:", bookingData);
      await UserService.bookingUser(bookingData);

      // Hiển thị thông báo thành công với nút xác nhận
      message.success(
        <div>
          <p className="font-semibold">Đặt lịch thành công!</p>
          <p className="text-sm mt-1">
            Lịch hẹn của bạn đã được ghi nhận vào hệ thống.
          </p>
          <div className="mt-3 flex justify-between">
            <span
              className="px-3 py-1 bg-[var(--primary-color)] text-white rounded text-xs cursor-pointer"
              onClick={() => {
                navigate("/profile");
              }}
            >
              Xem lịch hẹn
            </span>
            <span
              className="px-3 py-1 bg-gray-200 rounded text-xs cursor-pointer"
              onClick={() => {
                // Reset form sau khi đặt lịch thành công
                setSelectedServices([]);
                setFormData({
                  ...formData,
                  date: "",
                  time: "",
                  specialistId: "",
                  notes: "",
                });
                // Làm mới danh sách khung giờ đã đặt
                setBookedTimeSlots([]);
              }}
            >
              Đặt lịch khác
            </span>
          </div>
        </div>
      );
    } catch (error) {
      console.error("Lỗi khi đặt lịch:", error);

      let title = "Lỗi khi đặt lịch!";
      let message =
        error.message || "Không thể đặt lịch. Vui lòng thử lại sau.";
      let actions = null;

      // Xử lý các trường hợp lỗi cụ thể
      if (error.status === 409) {
        title = "Nhân viên đã có lịch!";
        message =
          "Chuyên viên này đã có lịch hẹn trong khung giờ đã chọn. Vui lòng chọn khung giờ khác hoặc chuyên viên khác.";

        // Cập nhật lại danh sách khung giờ đã đặt
        fetchBookedTimeSlots();
      } else if (error.response?.data?.message) {
        // Xử lý các thông báo lỗi từ server
        message = error.response.data.message;

        if (message.includes("time slot is not available")) {
          title = "Khung giờ không khả dụng!";
          message =
            "Khung giờ này đã có lịch hẹn. Vui lòng chọn thời gian khác hoặc chuyên viên khác.";
        } else if (message.includes("conflict")) {
          title = "Xung đột lịch trình!";
          message =
            "Chuyên viên này đang có lịch hẹn chưa hoàn thành trong khung giờ này.";
        } else if (message.includes("already have a booking")) {
          title = "Trùng lịch hẹn!";
          message = "Bạn đã có lịch hẹn trong khung giờ này.";
          actions = (
            <div className="mt-2 flex space-x-2">
              <button
                className="px-3 py-1 bg-[var(--primary-color)] text-white rounded text-xs"
                onClick={() => {
                  navigate("/profile");
                }}
              >
                Xem lịch hẹn
              </button>
              <button
                className="px-3 py-1 bg-gray-200 rounded text-xs"
                onClick={() => message.dismiss()}
              >
                Đóng
              </button>
            </div>
          );
        }
      }

      message.error(
        <div>
          <p className="font-semibold">{title}</p>
          <p>{message}</p>
          {actions}
        </div>
      );
    } finally {
      setLoading(false);
    }
  };

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
      setSelectedServices(selectedServices.filter((id) => id !== serviceId));
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
        <form
          onSubmit={handleBooking}
          className="p-8 border-3 border-[var(--primary-color)]/50 rounded-2xl"
        >
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
                    checked={selectedServices.includes(service.id)}
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
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="w-1/2">
              <p className="text-xl font-semibold">Giờ</p>
              <select
                name="time"
                id="time"
                className={`w-full p-2 border-2 border-black/10 rounded-md outline-none my-3 cursor-pointer`}
                value={formData.time}
                onChange={handleInputChange}
              >
                <option value="">Chọn giờ</option>
                {[
                  "07:00",
                  "07:30",
                  "08:00",
                  "08:30",
                  "09:00",
                  "09:30",
                  "10:00",
                  "10:30",
                  "11:00",
                  "11:30",
                  "12:00",
                  "12:30",
                  "13:00",
                  "13:30",
                  "14:00",
                  "14:30",
                  "15:00",
                  "15:30",
                  "16:00",
                  "16:30",
                  "17:00",
                  "17:30",
                  "18:00",
                ].map((time) => (
                  <option
                    key={time}
                    value={time}
                    disabled={isTimeSlotBooked(time)}
                    className={
                      isTimeSlotBooked(time) ? "text-gray-300 bg-gray-100" : ""
                    }
                  >
                    {time} {isTimeSlotBooked(time) ? "(Đã đặt)" : ""}
                  </option>
                ))}
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
              onClick={handleBooking}
              id="booking-submit-btn"
              type="submit"
              className="w-1/2 mt-5 bg-[var(--primary-color)] text-white py-2 rounded-md hover:bg-[var(--primary-color-dark)] disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span>Đang xử lý...</span>
                </div>
              ) : (
                "Đặt lịch"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Booking;
