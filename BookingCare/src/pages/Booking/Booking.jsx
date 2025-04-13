import React, { useState, useEffect, useContext, useCallback, useMemo, useRef } from "react";
import UserService from "../../../services/UserService";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { MessageContext } from "../../contexts/MessageProvider";

function Booking() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const message = useContext(MessageContext);
  
  // Cache lưu trữ thông tin khung giờ đã đặt theo ngày
  const timeSlotCache = useRef({});

  // State quản lý dữ liệu form
  const [formData, setFormData] = useState({
    name: user?.firstName ? `${user.firstName} ${user.lastName}` : "",
    phone: user?.phone || "",
    date: "",
    time: "",
    notes: "",
    specialistId: "",
  });
  
  // State quản lý dữ liệu chung
  const [selectedServices, setSelectedServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  
  // State quản lý trạng thái loading
  const [dataLoading, setDataLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [specialistsLoading, setSpecialistsLoading] = useState(true);
  const [fetchingTimeSlots, setFetchingTimeSlots] = useState(false);

  // State quản lý khung giờ đã đặt
  const [bookedTimeSlots, setBookedTimeSlots] = useState([]);
  const [allStaffBookedTimeSlots, setAllStaffBookedTimeSlots] = useState({});

  // Tối ưu: Tải riêng các dữ liệu cần thiết
  const fetchServices = useCallback(async () => {
    try {
      setServicesLoading(true);
      const servicesData = await UserService.getServices();
      
      // Xử lý và chuẩn hóa dữ liệu
      const formattedServices = servicesData.map((service) => ({
        id: service.id,
        name: service.name,
        desc: service.description,
        duration: service.duration || 60, // Mặc định 60 phút nếu không có thông tin
        price: `${new Intl.NumberFormat("vi-VN").format(service.price)}₫`,
        priceValue: service.price,
      }));
      
      setServices(formattedServices);
      return formattedServices;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách dịch vụ:", error);
      message.error("Không thể tải danh sách dịch vụ. Vui lòng thử lại sau.");
      return [];
    } finally {
      setServicesLoading(false);
    }
  }, [message]);

  const fetchSpecialists = useCallback(async () => {
    try {
      setSpecialistsLoading(true);
      const staffData = await UserService.getStaff();
      
      // Xử lý và chuẩn hóa dữ liệu
      const formattedStaff = staffData.map((staff) => ({
        id: staff.id,
        name: `${staff.firstName} ${staff.lastName}`,
        desc: staff.description || `Chuyên viên chăm sóc da với nhiều năm kinh nghiệm.`,
      }));
      
      setSpecialists(formattedStaff);
      return formattedStaff;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách chuyên viên:", error);
      message.error("Không thể tải danh sách chuyên viên. Vui lòng thử lại sau.");
      return [];
    } finally {
      setSpecialistsLoading(false);
    }
  }, [message]);

  // Tối ưu: Chia nhỏ và tải song song các API cần thiết
  useEffect(() => {
    const fetchInitialData = async () => {
      setDataLoading(true);
      
      // Tải song song dữ liệu dịch vụ và chuyên viên
      await Promise.all([
        fetchServices(),
        fetchSpecialists()
      ]);
      
      setDataLoading(false);
    };

    fetchInitialData();
  }, [fetchServices, fetchSpecialists]);

  // Tối ưu: Sử dụng cache cho fetch booked time slots
  const fetchBookedTimeSlots = useCallback(async () => {
    // Chỉ fetch nếu có ngày được chọn
    if (!formData.date) {
      console.log("Missing date for fetchBookedTimeSlots.");
      setBookedTimeSlots([]);
      return;
    }

    try {
      // Kiểm tra cache trước khi fetch
      const dateKey = formData.date;
      const now = new Date().getTime();
      const cacheTTL = 5 * 60 * 1000; // 5 phút

      // Nếu có cache và còn hiệu lực, sử dụng cache
      if (
        timeSlotCache.current[dateKey] && 
        (now - timeSlotCache.current[dateKey].timestamp < cacheTTL)
      ) {
        console.log("Using cached booked time slots for date:", dateKey);
        setAllStaffBookedTimeSlots(timeSlotCache.current[dateKey].data || {});
        
        // Cập nhật booked slots cho nhân viên đã chọn
        if (formData.specialistId) {
          const staffSlots = timeSlotCache.current[dateKey].data[formData.specialistId] || [];
          setBookedTimeSlots(staffSlots);
        }
        
        return;
      }

      // Hiển thị trạng thái đang tải 
      setFetchingTimeSlots(true);
      
      // Chuyển đổi chuỗi ngày thành đối tượng Date
      const dateObj = new Date(formData.date);
      
      // Lấy tất cả khung giờ đã đặt cho tất cả nhân viên trong ngày
      const allBookedSlots = await UserService.getAllStaffBookedTimeSlots(dateObj);
      console.log("All staff booked slots received:", allBookedSlots);
      
      // Lưu vào cache
      timeSlotCache.current[dateKey] = {
        data: allBookedSlots || {},
        timestamp: now
      };
      
      // Lưu trữ tất cả dữ liệu để sử dụng lại khi người dùng chuyển đổi nhân viên
      setAllStaffBookedTimeSlots(allBookedSlots || {});
      
      // Nếu đã chọn nhân viên, lọc các khung giờ đã đặt cho nhân viên đó
      if (formData.specialistId) {
        const staffBookedSlots = allBookedSlots[formData.specialistId] || [];
        setBookedTimeSlots(staffBookedSlots);
        
        // Kiểm tra nếu khung giờ hiện tại đã được đặt
        if (formData.time && staffBookedSlots.includes(formData.time)) {
          console.log(`Selected time ${formData.time} is already booked`);
          message.warning("Khung giờ này đã được đặt. Vui lòng chọn thời gian khác.");
        }
      } else {
        setBookedTimeSlots([]);
      }
    } catch (error) {
      console.error("Failed to fetch booked slots:", error);
      message.error("Không thể tải danh sách khung giờ đã đặt. Đang hiển thị tất cả khung giờ.");
      setBookedTimeSlots([]);
    } finally {
      // Ẩn trạng thái đang tải
      setFetchingTimeSlots(false);
    }
  }, [formData.date, formData.specialistId, formData.time, message]);

  // Chỉ gọi API khi ngày thay đổi
  useEffect(() => {
    if (formData.date) {
      fetchBookedTimeSlots();
    }
  }, [formData.date, fetchBookedTimeSlots]);

  // Tối ưu: Chỉ cập nhật từ cache khi thay đổi nhân viên, không gọi API
  useEffect(() => {
    if (formData.specialistId && Object.keys(allStaffBookedTimeSlots).length > 0) {
      const staffBookedSlots = allStaffBookedTimeSlots[formData.specialistId] || [];
      setBookedTimeSlots(staffBookedSlots);
      
      // Kiểm tra nếu khung giờ hiện tại đã được đặt
      if (formData.time && staffBookedSlots.includes(formData.time)) {
        message.warning("Khung giờ này đã được đặt cho nhân viên này. Vui lòng chọn thời gian khác.");
      }
    } else {
      setBookedTimeSlots([]);
    }
  }, [formData.specialistId, allStaffBookedTimeSlots, formData.time, message]);

  // Tối ưu: Chỉ hiển thị thông báo khi cần thiết, tránh re-render không cần thiết
  useEffect(() => {
    if (formData.time && bookedTimeSlots.length > 0 && bookedTimeSlots.includes(formData.time)) {
      message.warning("Khung giờ này đã được đặt. Vui lòng chọn thời gian khác.");
    }
  }, [formData.time, bookedTimeSlots, message]);

  // Tối ưu: Memoize hàm tính toán thời lượng
  const calculateServiceDuration = useCallback(() => {
    if (selectedServices.length === 0) {
      return 60; // Mặc định 60 phút nếu chưa chọn dịch vụ
    }
    
    // Tính tổng thời lượng của các dịch vụ đã chọn
    let totalDuration = 0;
    selectedServices.forEach(serviceId => {
      const service = services.find(s => s.id === serviceId);
      if (service) {
        totalDuration += service.duration || 60; // Mặc định 60 phút nếu không có thông tin thời lượng
      }
    });
    
    return Math.max(totalDuration, 30); // Đảm bảo thời lượng tối thiểu là 30 phút
  }, [selectedServices, services]);

  // Tối ưu: Memoize kết quả tính toán thời lượng
  const estimatedDuration = useMemo(() => {
    const duration = calculateServiceDuration();
    if (duration >= 60) {
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;
      return `${hours} giờ${minutes > 0 ? ` ${minutes} phút` : ''}`;
    } else {
      return `${duration} phút`;
    }
  }, [calculateServiceDuration]);

  // Tối ưu: Memoize thời gian kết thúc dự kiến
  const estimatedEndTime = useMemo(() => {
    if (!formData.time) return '';
    
    const duration = calculateServiceDuration();
    const [hours, minutes] = formData.time.split(':').map(Number);
    
    // Tính thời gian kết thúc
    let endHours = hours + Math.floor((minutes + duration) / 60);
    const endMinutes = (minutes + duration) % 60;
    
    // Format thời gian kết thúc
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  }, [formData.time, calculateServiceDuration]);

  // Tối ưu: Memoize hàm kiểm tra khung giờ
  const isTimeSlotBooked = useCallback((timeSlot) => {
    // Kiểm tra xem khung giờ có nằm trong danh sách đã đặt không
    if (bookedTimeSlots.includes(timeSlot)) {
      return true;
    }
    
    // Chuyển timeSlot thành phút trong ngày để dễ so sánh
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const timeSlotMinutes = hours * 60 + minutes;
    
    // Kiểm tra xem khung giờ có nằm trong khoảng thời gian của một lịch đặt nào đó không
    for (const bookedSlot of bookedTimeSlots) {
      const [bookedHours, bookedMinutes] = bookedSlot.split(':').map(Number);
      const bookedSlotMinutes = bookedHours * 60 + bookedMinutes;
      
      // Tính toán thời gian kết thúc dự kiến của lịch đặt dựa trên thời lượng dịch vụ
      // Sử dụng thời lượng ước tính 60 phút cho các lịch đặt của người khác
      const estimatedDuration = 60; // Thời lượng ước tính (phút)
      
      // Nếu khung giờ hiện tại nằm trong khoảng từ giờ bắt đầu đến giờ kết thúc của lịch đặt
      if (timeSlotMinutes >= bookedSlotMinutes && timeSlotMinutes < bookedSlotMinutes + estimatedDuration) {
        return true;
      }
    }
    
    // Kiểm tra thêm: thời gian chọn với khung thời gian hiện tại
    if (formData.time && timeSlot !== formData.time) {
      const [selectedHours, selectedMinutes] = formData.time.split(':').map(Number);
      const selectedTimeMinutes = selectedHours * 60 + selectedMinutes;
      
      // Sử dụng thời lượng thực tế của các dịch vụ đã chọn
      const serviceDuration = calculateServiceDuration();
      
      // Nếu khung giờ hiện tại nằm trong khoảng thời gian đã chọn
      if (timeSlotMinutes > selectedTimeMinutes && 
          timeSlotMinutes < selectedTimeMinutes + serviceDuration) {
        return true;
      }
    }
    
    return false;
  }, [bookedTimeSlots, formData.time, calculateServiceDuration]);

  // Tối ưu: Kiểm tra trước khi đặt lịch
  const isBookingDisabled = useMemo(() => {
    return (
      !formData.name ||
      !formData.phone ||
      !formData.date ||
      !formData.time ||
      !formData.specialistId ||
      selectedServices.length === 0 ||
      loading
    );
  }, [formData.name, formData.phone, formData.date, formData.time, formData.specialistId, selectedServices.length, loading]);

  // Tối ưu: Tách xử lý cho handleBooking
  const handleBooking = useCallback(async (e) => {
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
  }, [user, formData, selectedServices, message, navigate]);

  // Tối ưu: Sử dụng useCallback cho processBooking
  const processBooking = useCallback(async () => {
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
        staffId: formData.specialistId,
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
                // Làm mới danh sách khung giờ đã đặt và cache
                setBookedTimeSlots([]);
                setAllStaffBookedTimeSlots({});
                // Xóa cache
                timeSlotCache.current = {};
                UserService.clearBookingCache();
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
      let messageText = error.message || "Không thể đặt lịch. Vui lòng thử lại sau.";
      let actions = null;

      // Xử lý các trường hợp lỗi cụ thể
      if (error.status === 409) {
        title = "Nhân viên đã có lịch!";
        messageText = "Chuyên viên này đã có lịch hẹn trong khung giờ đã chọn. Vui lòng chọn khung giờ khác hoặc chuyên viên khác.";

        // Cập nhật lại danh sách khung giờ đã đặt
        fetchBookedTimeSlots();
      } else if (error.response?.data?.message) {
        // Xử lý các thông báo lỗi từ server
        messageText = error.response.data.message;

        if (messageText.includes("time slot is not available")) {
          title = "Khung giờ không khả dụng!";
          messageText = "Khung giờ này đã có lịch hẹn. Vui lòng chọn thời gian khác hoặc chuyên viên khác.";
        } else if (messageText.includes("conflict")) {
          title = "Xung đột lịch trình!";
          messageText = "Chuyên viên này đang có lịch hẹn chưa hoàn thành trong khung giờ này.";
        } else if (messageText.includes("already have a booking")) {
          title = "Trùng lịch hẹn!";
          messageText = "Bạn đã có lịch hẹn trong khung giờ này.";
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
          <p>{messageText}</p>
          {actions}
        </div>
      );
    } finally {
      setLoading(false);
    }
  }, [user, formData, selectedServices, services, message, navigate, fetchBookedTimeSlots]);

  // Tối ưu: Sử dụng debounce cho handleInputChange hoặc useCallback
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  // Tối ưu: Sử dụng useCallback cho handleServiceChange
  const handleServiceChange = useCallback((e, serviceId) => {
    if (e.target.checked) {
      setSelectedServices(prev => [...prev, serviceId]);
    } else {
      setSelectedServices(prev => prev.filter((id) => id !== serviceId));
    }
  }, []);

  // Tối ưu: Kiểm tra thời lượng dịch vụ khi chọn, chỉ hiển thị cảnh báo nếu cần
  useEffect(() => {
    if (selectedServices.length > 0) {
      const duration = calculateServiceDuration();
      if (duration > 120) { // Nếu thời gian dịch vụ vượt quá 2 giờ
        message.warning(
          <div>
            <p className="font-semibold">Thời gian dịch vụ dài</p>
            <p>Tổng thời gian cho các dịch vụ đã chọn là {estimatedDuration}. Bạn có thể cân nhắc chia thành nhiều lần đặt lịch.</p>
          </div>
        );
      }
    }
  }, [selectedServices, calculateServiceDuration, estimatedDuration, message]);

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
            {servicesLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="w-6 h-6 border-2 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin mr-2"></div>
                <span>Đang tải dịch vụ...</span>
              </div>
            ) : (
              services.map((service, index) => (
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
              ))
            )}
            {selectedServices.length > 0 && (
              <div className="mt-2 border-t border-gray-200 pt-2 flex justify-between items-center">
                <div className="text-gray-700">
                  <span className="font-medium">Tổng thời gian: </span> 
                  <span>{estimatedDuration}</span>
                </div>
                <div className="text-gray-700">
                  <span className="font-medium">Đã chọn: </span>
                  <span>{selectedServices.length} dịch vụ</span>
                </div>
              </div>
            )}
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
              <div className="relative">
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
                {fetchingTimeSlots && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-[var(--primary-color)] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </div>
            <div className="w-1/2">
              <p className="text-xl font-semibold">Giờ</p>
              <select
                name="time"
                id="time"
                className={`w-full p-2 border-2 border-black/10 rounded-md outline-none my-3 cursor-pointer`}
                value={formData.time}
                onChange={handleInputChange}
                disabled={fetchingTimeSlots || !formData.date}
              >
                <option value="">Chọn giờ</option>
                {fetchingTimeSlots ? (
                  <option disabled>Đang tải khung giờ...</option>
                ) : !formData.date ? (
                  <option disabled>Vui lòng chọn ngày trước</option>
                ) : (
                  [
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
                  ))
                )}
              </select>
              {formData.time && selectedServices.length > 0 && (
                <div className="text-sm text-gray-600 mt-1">
                  <p>
                    Thời gian dự kiến: <span className="font-medium">{estimatedDuration}</span>
                  </p>
                  <p>
                    Kết thúc lúc: <span className="font-medium">{estimatedEndTime}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
          <p className="text-xl font-semibold mt-3">Chuyên viên</p>
          <select
            name="specialistId"
            id="specialistId"
            className="w-full p-2 border-2 border-black/10 rounded-md outline-none my-3"
            value={formData.specialistId}
            onChange={handleInputChange}
            disabled={fetchingTimeSlots || specialistsLoading}
          >
            <option value="">Chọn chuyên viên</option>
            {specialistsLoading ? (
              <option disabled>Đang tải danh sách chuyên viên...</option>
            ) : (
              specialists.map((specialist, index) => (
                <option value={specialist.id} key={index}>
                  {specialist.name}
                </option>
              ))
            )}
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
              className="w-1/2 mt-5 bg-[var(--primary-color)] text-white py-2 rounded-md hover:bg-[var(--primary-color-dark)] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isBookingDisabled}
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
