import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import ServiceService from "../../../services/ServiceService";
import SpecialistService from "../../../services/SpecialistService";
import BookingService from "../../../services/BookingService";
import UserService from "../../../services/UserService";
import { useSelector } from "react-redux";
import { MessageContext } from "../../contexts/MessageProvider";

function Booking() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const message = useContext(MessageContext);
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  
  // Kiểm tra và xử lý thông tin người dùng để tránh hiển thị null null
  const userFullName = userData?.fullName || 
                      (userData?.firstName && userData?.lastName ? 
                        `${userData.firstName} ${userData.lastName}`.trim() : 
                        userData?.username || "");
  const userPhone = userData?.phone || "";

  // State for form data
  const [formData, setFormData] = useState({
    customerId: userData?.id || "",
    staffId: "",
    serviceIds: [],
    bookingDate: "",
    startTime: "",
    notes: "",
    fullName: userFullName,
    phone: userPhone,
  });
  
  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState({
    services: true,
    specialists: false,
    timeSlots: false,
    submitting: false
  });
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState(null);
  // Thêm state mới để lưu thông tin xung đột thời gian
  const [conflictData, setConflictData] = useState(null);
  // Thêm state mới để lưu danh sách thời gian đã đặt
  const [bookedTimeSlots, setBookedTimeSlots] = useState([]);
  
  // Available time slots (simplified)
  const timeSlots = [
    "07:00", "07:30", "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", 
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", 
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"
  ];

  // Fetch services when component mounts
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const servicesData = await ServiceService.getAllServices();
        setServices(servicesData);
      } catch (error) {
        console.error("Error fetching services:", error);
        setError("Không thể tải danh sách dịch vụ");
        message.error("Không thể tải danh sách dịch vụ");
      } finally {
        setLoading(prev => ({ ...prev, services: false }));
      }
    };

    fetchServices();
  }, [message]);

  // Fetch specialists when component mounts - try to get ACTIVE specialists first
  useEffect(() => {
    const fetchSpecialists = async () => {
      try {
        setLoading(prev => ({ ...prev, specialists: true }));
        setError("");
        
        console.log("Fetching specialists");
        
        // Try to get active specialists first
        try {
          // Get specialists with ACTIVE status
          const activeSpecialists = await SpecialistService.getSpecialistsByStatus("ACTIVE");
          console.log("Got specialists by status:", activeSpecialists);
          
          if (activeSpecialists && Array.isArray(activeSpecialists) && activeSpecialists.length > 0) {
            // Filter to make sure they have valid IDs and names
            const validSpecialists = activeSpecialists.filter(specialist => 
              specialist && specialist.id && 
              (specialist.fullName || specialist.name || specialist.firstName || specialist.lastName)
            );
            
            console.log("Valid active specialists found:", validSpecialists.length);
            setSpecialists(validSpecialists);
          } else {
            // If no active specialists, fall back to all specialists
            throw new Error("No active specialists found");
          }
        } catch (statusError) {
          console.warn("Error getting specialists by status:", statusError.message);
          
          // Fall back to getting all specialists
          const allSpecialists = await SpecialistService.getAllSpecialists();
          console.log("Got all specialists:", allSpecialists);
          
          if (allSpecialists && Array.isArray(allSpecialists) && allSpecialists.length > 0) {
            const validSpecialists = allSpecialists.filter(specialist => 
              specialist && specialist.id && 
              (specialist.fullName || specialist.name || specialist.firstName || specialist.lastName)
            );
            
            console.log("Valid specialists from getAllSpecialists:", validSpecialists.length);
            setSpecialists(validSpecialists);
          } else {
            console.warn("No specialists found at all");
            setSpecialists([]);
            setError("Không tìm thấy chuyên viên nào. Vui lòng thử lại sau.");
            message.error("Không tìm thấy chuyên viên nào. Vui lòng thử lại sau.");
          }
        }
      } catch (error) {
        console.error("Error fetching specialists:", error);
        setError("Không thể tải danh sách chuyên viên");
        message.error("Không thể tải danh sách chuyên viên");
        setSpecialists([]);
      } finally {
        setLoading(prev => ({ ...prev, specialists: false }));
      }
    };

    fetchSpecialists();
  }, [message]); // Only fetch once when component mounts

  // Thêm useEffect để tải các khung giờ đã đặt khi người dùng chọn chuyên viên và ngày
  useEffect(() => {
    const fetchBookedTimeSlots = async () => {
      // Chỉ tải khi đã có đủ thông tin
      if (!formData.staffId || !formData.bookingDate) {
        setBookedTimeSlots([]);
        return;
      }

      try {
        setLoading(prev => ({ ...prev, timeSlots: true }));
        
        console.log(`Fetching booked time slots for staff ${formData.staffId} on date ${formData.bookingDate}`);
        
        // Gọi API để lấy danh sách thời gian đã đặt
        const response = await BookingService.getBookedTimeSlots(formData.staffId, formData.bookingDate);
        
        console.log("Received booked time slots:", response);
        
        if (response && Array.isArray(response)) {
          setBookedTimeSlots(response);
          console.log(`Booked slots set to: [${response.join(', ')}]`);
        } else {
          console.warn("Invalid response format for booked time slots:", response);
          setBookedTimeSlots([]);
        }
      } catch (error) {
        console.error("Error fetching booked time slots:", error);
        setBookedTimeSlots([]);
      } finally {
        setLoading(prev => ({ ...prev, timeSlots: false }));
      }
    };

    fetchBookedTimeSlots();
  }, [formData.staffId, formData.bookingDate]);

  // Handle input changes for all form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Reset conflict data when changing date or time
    if (name === "bookingDate" || name === "startTime") {
      setConflictData(null);
    }
    
    // Special handling for serviceIds
    if (name === "serviceIds") {
      setFormData({
        ...formData,
        [name]: [value], // For now, we only support single service selection
        staffId: "" // Reset specialist when service changes
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Handle service selection
  const handleServiceChange = (e) => {
    const serviceId = e.target.value;
    setSelectedServiceId(serviceId);
    // Reset conflict data when changing service
    setConflictData(null);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setError("");
    setSuccessData(null);
    setConflictData(null);
    
    // Simple validation
    if (!formData.fullName || !formData.phone || !selectedServiceId || 
        !formData.bookingDate || !formData.startTime || !formData.staffId) {
      setError("Vui lòng điền đầy đủ thông tin");
      message.error("Vui lòng điền đầy đủ thông tin");
      return;
    }
    
    try {
      setLoading(prev => ({ ...prev, submitting: true }));
      
      // Get user ID (customerId) from redux store
      const customerId = user?.id;
      
      if (!customerId) {
        setError("Vui lòng đăng nhập để đặt lịch");
        message.error("Vui lòng đăng nhập để đặt lịch");
        setLoading(prev => ({ ...prev, submitting: false }));
        return;
      }
      
      // Double check that the specialistId is from our list of specialists
      const selectedSpecialist = specialists.find(s => s.id === formData.staffId);
      if (!selectedSpecialist) {
        setError("Chuyên viên không hợp lệ. Vui lòng chọn lại.");
        message.error("Chuyên viên không hợp lệ. Vui lòng chọn lại.");
        setLoading(prev => ({ ...prev, submitting: false }));
        return;
      }
      
      // Get the selected service to calculate total price
      const selectedService = services.find(s => s.id === selectedServiceId);
      if (!selectedService) {
        setError("Dịch vụ không hợp lệ. Vui lòng chọn lại.");
        message.error("Dịch vụ không hợp lệ. Vui lòng chọn lại.");
        setLoading(prev => ({ ...prev, submitting: false }));
        return;
      }
      
      // Create a set of serviceIds in the correct format (single item in this case)
      const serviceIds = [selectedServiceId];
      
      // Calculate total price - this is expected by the backend
      const totalPrice = String(selectedService.price || 0);
      
      // Format date and time to match backend expectations (yyyy-MM-dd for date, HH:mm for time)
      // Calculate estimated end time based on service duration if available
      let endTime = formData.startTime; // Default to start time
      if (selectedService.duration) {
        const [hours, minutes] = formData.startTime.split(':').map(Number);
        // Calculate end time based on duration in minutes
        const totalMinutes = hours * 60 + minutes + (selectedService.duration || 60);
        const endHours = Math.floor(totalMinutes / 60) % 24;
        const endMinutes = totalMinutes % 60;
        endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
      } else {
        // If no duration, estimate 1 hour
        const [hours, minutes] = formData.startTime.split(':').map(Number);
        const endHours = (hours + 1) % 24; // Handle midnight crossing
        endTime = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }
      
      // Cập nhật thông tin người dùng trong localStorage nếu họ tên hoặc số điện thoại đã thay đổi
      if (userData && (userData.fullName !== formData.fullName || userData.phone !== formData.phone)) {
        try {
          const updatedUserData = {
            ...userData,
            fullName: formData.fullName,
            phone: formData.phone
          };
          localStorage.setItem("user", JSON.stringify(updatedUserData));
          
          // Nếu có ID người dùng, cập nhật thông tin lên server (không chờ đợi kết quả)
          if (userData.id) {
            UserService.updateUserInfo(userData.id, {
              fullName: formData.fullName,
              phone: formData.phone
            }, user?.access_token).catch(err => console.warn("Không thể cập nhật thông tin người dùng:", err));
          }
        } catch (error) {
          console.warn("Không thể cập nhật thông tin người dùng trong localStorage:", error);
        }
      }
      
      // Create booking data that matches the backend BookingRequest model exactly
      const bookingData = {
        customerId: String(customerId),
        staffId: String(formData.staffId),
        serviceIds: serviceIds,
        bookingDate: formData.bookingDate,
        startTime: formData.startTime,
        endTime: endTime,
        totalPrice: totalPrice,
        notes: formData.notes || "",
        // Thêm thông tin họ tên và số điện thoại
        fullName: formData.fullName,
        phone: formData.phone
      };
      
      console.log("Sending booking data:", bookingData);
      
      // Submit booking
      const response = await BookingService.createBooking(bookingData);
      
      if (response.success) {
        // Hiển thị thông báo thành công
        message.success(response.message || "Đặt lịch thành công!");
        
        // Đảm bảo thông tin từ form được gán vào dữ liệu thành công
        const updatedSuccessData = {
          ...response.data,
          customerName: formData.fullName,
          customerPhone: formData.phone
        };
        
        setSuccessData(updatedSuccessData);
        
        // Redirect after 3 seconds
        setTimeout(() => {
          navigate("/profile");
        }, 3000);
      } else {
        // Handle specific errors
        if (response.error && (
          response.error.includes("not a specialist") || 
          response.error.includes("chuyên viên") ||
          response.reason === "SPECIALIST_ERROR"
        )) {
          setError("Người bạn chọn không phải là chuyên viên. Vui lòng chọn một chuyên viên khác.");
          message.error("Người bạn chọn không phải là chuyên viên. Vui lòng chọn một chuyên viên khác.");
        } else if (response.status === 409 || response.reason === "TIME_CONFLICT" || response.reason === "STAFF_CONFLICT") {
          setError("Đã đặt trên thời gian. Vui lòng chọn thời gian khác.");
          message.error("Đã đặt trên thời gian. Vui lòng chọn thời gian khác.");
          
          // Lưu thông tin xung đột thời gian để hiển thị
          if (response.conflictData || response.conflictingBooking) {
            setConflictData(response.conflictData || response.conflictingBooking);
          } else {
            // Tạo dữ liệu xung đột cơ bản nếu không có thông tin chi tiết
            setConflictData({
              staffName: selectedSpecialist.fullName || selectedSpecialist.name || `${selectedSpecialist.firstName || ''} ${selectedSpecialist.lastName || ''}`.trim(),
              bookingDate: formData.bookingDate,
              startTime: formData.startTime,
              endTime: endTime,
              status: "Đã đặt"
            });
          }
        } else if (response.status === 400 || response.reason === "INVALID_DATA" || response.reason === "INVALID_BOOKING") {
          setError(response.error || "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.");
          message.error(response.error || "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.");
        } else if (response.status === 404 || response.reason === "RESOURCE_NOT_FOUND" || response.reason === "NOT_FOUND") {
          setError(response.error || "Không tìm thấy thông tin. Vui lòng thử lại.");
          message.error(response.error || "Không tìm thấy thông tin. Vui lòng thử lại.");
        } else {
          setError(response.error || "Đặt lịch thất bại. Vui lòng thử lại sau.");
          message.error(response.error || "Đặt lịch thất bại. Vui lòng thử lại sau.");
        }
      }
    } catch (error) {
      console.error("Booking error:", error);
      setError("Đã xảy ra lỗi khi đặt lịch. Vui lòng thử lại sau.");
      message.error("Đã xảy ra lỗi khi đặt lịch. Vui lòng thử lại sau.");
    } finally {
      setLoading(prev => ({ ...prev, submitting: false }));
    }
  };

  // Render success confirmation
  if (successData) {
    return (
      <div className="my-30">
        <div className="w-[900px] mx-auto">
          <div className="p-8 border-3 border-[var(--primary-color)]/50 rounded-2xl bg-white shadow-lg">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-6">
                <i className="fas fa-check text-green-500 text-3xl"></i>
              </div>
              <h2 className="text-3xl font-bold text-green-600 mb-4">Đặt lịch thành công!</h2>
              <p className="text-lg mb-6">Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">Thông tin đặt lịch</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Dịch vụ</p>
                  <p className="font-medium">
                    {successData?.services?.map(s => s.name).join(', ') || 
                     services.find(s => s.id === selectedServiceId)?.name || 'Không có thông tin'}
                  </p>
                </div>
                
                <div>
                  <p className="text-gray-600">Chuyên viên</p>
                  <p className="font-medium">{successData?.staffName || 'Chưa cập nhật'}</p>
                </div>
                
                <div>
                  <p className="text-gray-600">Họ tên khách hàng</p>
                  <p className="font-medium">{successData?.customerName || formData.fullName}</p>
                </div>
                
                <div>
                  <p className="text-gray-600">Số điện thoại</p>
                  <p className="font-medium">{successData?.customerPhone || formData.phone}</p>
                </div>
                
                <div>
                  <p className="text-gray-600">Ngày</p>
                  <p className="font-medium">{successData?.bookingDate || formData.bookingDate}</p>
                </div>
                
                <div>
                  <p className="text-gray-600">Giờ</p>
                  <p className="font-medium">{successData?.startTime || formData.startTime}</p>
                </div>
                
                <div>
                  <p className="text-gray-600">Tổng tiền</p>
                  <p className="font-medium">{new Intl.NumberFormat('vi-VN').format(successData?.totalPrice || 0)}đ</p>
                </div>
                
                <div>
                  <p className="text-gray-600">Trạng thái</p>
                  <p className="font-medium bg-yellow-100 text-yellow-800 px-2 py-1 rounded inline-block">
                    {successData?.statusDescription || 'Chờ xác nhận'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Bạn sẽ được chuyển đến trang cá nhân sau 3 giây...
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => navigate("/")}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Trang chủ
                </button>
                <button
                  onClick={() => navigate("/profile")}
                  className="px-6 py-2 bg-[var(--primary-color)] text-white rounded-md hover:bg-[var(--primary-color-dark)]"
                >
                  Xem lịch đặt
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-30">
      <div className="w-[900px] mx-auto">
        <form
          onSubmit={handleSubmit}
          className="p-8 border-3 border-[var(--primary-color)]/50 rounded-2xl bg-white shadow-lg"
        >
          <h2 className="text-3xl font-bold my-3 text-center">
            Đặt Lịch Dịch Vụ
          </h2>
          
          {/* Error message */}
          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4 flex items-start">
              <i className="fas fa-exclamation-triangle mr-2 mt-1 text-lg"></i>
              <span className="font-medium">{error}</span>
            </div>
          )}
          
          {/* Thông tin xung đột thời gian */}
          {conflictData && (
            <div className="bg-amber-50 border border-amber-300 text-amber-800 p-4 rounded-md mb-4">
              <h3 className="font-semibold mb-2">Đã đặt trên thời gian:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><b>Chuyên viên:</b> {conflictData.staffName}</div>
                <div><b>Trạng thái:</b> <span className="bg-amber-100 px-2 py-0.5 rounded-md text-amber-800">{conflictData.statusDescription || conflictData.status || "Đã đặt"}</span></div>
                <div><b>Ngày:</b> {conflictData.bookingDate}</div>
                <div><b>Thời gian:</b> {conflictData.startTime} - {conflictData.endTime}</div>
              </div>
              <p className="mt-2 text-sm">Vui lòng chọn thời gian khác hoặc chuyên viên khác.</p>
            </div>
          )}
          
          {/* Service selection */}
          <div className="mb-6">
            <p className="text-xl font-semibold mb-2">Dịch vụ <span className="text-red-500">*</span></p>
            <select
              name="service"
              id="service"
              className="w-full p-3 border-2 border-gray-200 rounded-lg outline-none focus:border-[var(--primary-color)] transition-colors"
              value={selectedServiceId}
              onChange={handleServiceChange}
              required
            >
              <option value="">Chọn dịch vụ</option>
              {loading.services ? (
                <option disabled>Đang tải...</option>
              ) : (
                services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name} - {new Intl.NumberFormat('vi-VN').format(service.price || 0)}đ ({service.duration} phút)
                  </option>
                ))
              )}
            </select>
          </div>
          
          {/* Grid layout for personal information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-xl font-semibold mb-2">Họ và tên <span className="text-red-500">*</span></p>
              <input
                type="text"
                name="fullName"
                id="fullName"
                placeholder="Nhập họ và tên..."
                className="w-full p-3 border-2 border-gray-200 rounded-lg outline-none focus:border-[var(--primary-color)] transition-colors"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <p className="text-xl font-semibold mb-2">Số điện thoại <span className="text-red-500">*</span></p>
              <input
                type="text"
                name="phone"
                id="phone"
                placeholder="Nhập số điện thoại..."
                className="w-full p-3 border-2 border-gray-200 rounded-lg outline-none focus:border-[var(--primary-color)] transition-colors"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          {/* Date and time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-xl font-semibold mb-2">Ngày <span className="text-red-500">*</span></p>
              <input
                type="date"
                name="bookingDate"
                id="bookingDate"
                className="w-full p-3 border-2 border-gray-200 rounded-lg outline-none focus:border-[var(--primary-color)] transition-colors cursor-pointer"
                value={formData.bookingDate}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
            <div>
              <p className="text-xl font-semibold mb-2">Giờ <span className="text-red-500">*</span></p>
              
              {/* Hiển thị loading indicator khi đang tải thời gian đã đặt */}
              {loading.timeSlots ? (
                <div className="flex items-center justify-center p-4 border-2 border-gray-200 rounded-lg bg-gray-50">
                  <span className="inline-block w-5 h-5 border-2 border-gray-300 border-t-[var(--primary-color)] rounded-full animate-spin mr-2"></span>
                  <span>Đang kiểm tra lịch đã đặt...</span>
                </div>
              ) : (
                <>
                  {/* Hiển thị custom time slot selector */}
                  <div className="border-2 border-gray-200 rounded-lg p-3">
                    <div className="grid grid-cols-4 gap-2 max-h-[200px] overflow-y-auto">
                      {timeSlots.map((time) => {
                        const isBooked = bookedTimeSlots.includes(time);
                        const isSelected = formData.startTime === time;
                        
                        return (
                          <div 
                            key={time}
                            onClick={() => !isBooked && handleChange({ target: { name: 'startTime', value: time } })}
                            className={`p-2 text-center rounded cursor-pointer transition-colors ${
                              isBooked 
                                ? 'bg-red-100 text-red-500 font-bold cursor-not-allowed' 
                                : isSelected
                                  ? 'bg-[var(--primary-color)] text-white font-semibold'
                                  : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            {time}
                            {isBooked && <div className="text-xs mt-1">Đã đặt</div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Hidden input for form validation */}
                  <input 
                    type="hidden" 
                    name="startTime" 
                    value={formData.startTime} 
                    required 
                  />
                  
                  {/* Selected time display */}
                  {formData.startTime && (
                    <div className="mt-2 p-2 bg-blue-50 rounded text-blue-700 flex items-center">
                      <i className="fas fa-clock mr-2"></i>
                      <span>Thời gian đã chọn: <strong>{formData.startTime}</strong></span>
                    </div>
                  )}
                </>
              )}
              
              {/* Thông báo khi có khung giờ đã đặt */}
              {!loading.timeSlots && bookedTimeSlots.length > 0 && (
                <div className="text-sm text-amber-600 mt-1">
                  <span className="inline-block mr-1">⚠️</span>
                  <strong>Có {bookedTimeSlots.length} khung giờ đã được đặt</strong> và không thể chọn
                </div>
              )}
            </div>
          </div>
          
          {/* Specialist selection */}
          <div className="mb-6">
            <p className="text-xl font-semibold mb-2">Chuyên viên <span className="text-red-500">*</span></p>
            <select
              name="staffId"
              id="staffId"
              className="w-full p-3 border-2 border-gray-200 rounded-lg outline-none focus:border-[var(--primary-color)] transition-colors"
              value={formData.staffId}
              onChange={handleChange}
              disabled={loading.specialists}
              required
            >
              <option value="">Chọn chuyên viên</option>
              {loading.specialists ? (
                <option disabled>Đang tải danh sách chuyên viên...</option>
              ) : specialists.length === 0 ? (
                <option disabled>
                  Không có chuyên viên nào
                </option>
              ) : (
                specialists.map((specialist) => (
                  <option key={specialist.id} value={specialist.id}>
                    {specialist.fullName || specialist.name || `${specialist.firstName || ''} ${specialist.lastName || ''}`.trim()}
                  </option>
                ))
              )}
            </select>
          </div>
          
          {/* Hiển thị thông tin về thời gian đã đặt */}
          {formData.staffId && formData.bookingDate && bookedTimeSlots.length > 0 && (
            <div className="mb-6 p-4 bg-amber-50 rounded-lg border-2 border-amber-300 shadow-sm">
              <p className="font-semibold text-amber-800 mb-3 flex items-center text-lg">
                <i className="fas fa-exclamation-circle mr-2"></i>
                Đã đặt trên thời gian cho chuyên viên này:
              </p>
              <div className="flex flex-wrap gap-3">
                {bookedTimeSlots.map(time => (
                  <span 
                    key={time} 
                    className="inline-block px-3 py-1.5 bg-amber-100 text-amber-800 rounded-md text-sm font-semibold border border-amber-200 shadow-sm"
                  >
                    {time}
                  </span>
                ))}
              </div>
              <p className="text-sm text-amber-700 mt-3 italic">
                Các khung giờ trên đã được đặt và không thể chọn. Vui lòng chọn khung giờ khác hoặc chuyên viên khác.
              </p>
            </div>
          )}
          
          {/* Notes */}
          <div className="mb-6">
            <p className="text-xl font-semibold mb-2">Ghi chú</p>
            <textarea
              name="notes"
              id="notes"
              placeholder="Nhập ghi chú nếu có..."
              className="w-full p-3 border-2 border-gray-200 rounded-lg outline-none focus:border-[var(--primary-color)] transition-colors"
              rows={4}
              value={formData.notes}
              onChange={handleChange}
            ></textarea>
          </div>
          
          {/* Submit button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="w-2/3 py-3 bg-[var(--primary-color)] text-white rounded-lg hover:bg-[var(--primary-color-dark)] transition-colors text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading.submitting}
            >
              {loading.submitting ? (
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
