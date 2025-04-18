import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import SpecialistService from "../../../services/SpecialistService";
import BookingService from "../../../services/BookingService";
import UserService from "../../../services/UserService";
import { useSelector } from "react-redux";
import { MessageContext } from "../../contexts/MessageProvider";
import { useServiceCache } from "./contexts/ServiceCacheContext";

// Component imports
import ServiceSelection from "./components/ServiceSelection";
import CustomerInfo from "./components/CustomerInfo";
import DateTimeSelection from "./components/DateTimeSelection";
import SpecialistSelection from "./components/SpecialistSelection";
import ConflictInfo from "./components/ConflictInfo";
import Notes from "./components/Notes";
import BookingSuccess from "./components/BookingSuccess";

function Booking() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const message = useContext(MessageContext);
  const { services } = useServiceCache();
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  const [countdown, setCountdown] = useState(10);
  
  // Kiểm tra và xử lý thông tin người dùng để tránh hiển thị null null
  const userFullName =
    userData?.fullName ||
    (userData?.firstName && userData?.lastName
      ? `${userData.firstName} ${userData.lastName}`.trim()
      : userData?.username || "");
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

  const [selectedServices, setSelectedServices] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState({
    specialists: false,
    timeSlots: false,
    submitting: false,
  });
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState(null);
  // Thêm state mới để lưu thông tin xung đột thời gian
  const [conflictData, setConflictData] = useState(null);
  // Thêm state mới để lưu danh sách thời gian đã đặt
  const [bookedTimeSlots, setBookedTimeSlots] = useState([]);

  // Fetch specialists when component mounts - try to get ACTIVE specialists first
  useEffect(() => {
    const fetchSpecialists = async () => {
      try {
        setLoading((prev) => ({ ...prev, specialists: true }));
        setError("");

        console.log("Fetching specialists");

        // Try to get active specialists first
        try {
          // Get specialists with ACTIVE status
          const activeSpecialists =
            await SpecialistService.getSpecialistsByStatus("ACTIVE");
          console.log("Got specialists by status:", activeSpecialists);

          if (
            activeSpecialists &&
            Array.isArray(activeSpecialists) &&
            activeSpecialists.length > 0
          ) {
            // Filter to make sure they have valid IDs and names
            const validSpecialists = activeSpecialists.filter(
              (specialist) =>
                specialist &&
                specialist.id &&
                (specialist.fullName ||
                  specialist.name ||
                  specialist.firstName ||
                  specialist.lastName)
            );

            console.log(
              "Valid active specialists found:",
              validSpecialists.length
            );
            setSpecialists(validSpecialists);
          } else {
            // If no active specialists, fall back to all specialists
            throw new Error("No active specialists found");
          }
        } catch (statusError) {
          console.warn(
            "Error getting specialists by status:",
            statusError.message
          );

          // Fall back to getting all specialists
          const allSpecialists = await SpecialistService.getAllSpecialists();
          console.log("Got all specialists:", allSpecialists);

          if (
            allSpecialists &&
            Array.isArray(allSpecialists) &&
            allSpecialists.length > 0
          ) {
            const validSpecialists = allSpecialists.filter(
              (specialist) =>
                specialist &&
                specialist.id &&
                (specialist.fullName ||
                  specialist.name ||
                  specialist.firstName ||
                  specialist.lastName)
            );

            console.log(
              "Valid specialists from getAllSpecialists:",
              validSpecialists.length
            );
            setSpecialists(validSpecialists);
          } else {
            console.warn("No specialists found at all");
            setSpecialists([]);
            setError("Không tìm thấy chuyên viên nào. Vui lòng thử lại sau.");
            message.error(
              "Không tìm thấy chuyên viên nào. Vui lòng thử lại sau."
            );
          }
        }
      } catch (error) {
        console.error("Error fetching specialists:", error);
        setError("Không thể tải danh sách chuyên viên");
        message.error("Không thể tải danh sách chuyên viên");
        setSpecialists([]);
      } finally {
        setLoading((prev) => ({ ...prev, specialists: false }));
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
        setLoading((prev) => ({ ...prev, timeSlots: true }));

        console.log(
          `Fetching booked time slots for staff ${formData.staffId} on date ${formData.bookingDate}`
        );

        // Gọi API để lấy danh sách thời gian đã đặt
        const response = await BookingService.getBookedTimeSlots(
          formData.staffId,
          formData.bookingDate
        );

        console.log("Received booked time slots:", response);

        if (response && Array.isArray(response)) {
          setBookedTimeSlots(response);
          console.log(`Booked slots set to: [${response.join(", ")}]`);
        } else {
          console.warn(
            "Invalid response format for booked time slots:",
            response
          );
          setBookedTimeSlots([]);
        }
      } catch (error) {
        console.error("Error fetching booked time slots:", error);
        setBookedTimeSlots([]);
      } finally {
        setLoading((prev) => ({ ...prev, timeSlots: false }));
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
        staffId: "", // Reset specialist when service changes
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Handle service selection
  const handleServiceChange = (e, serviceId) => {
    // Toggle service selection
    const isChecked = e.target.checked;

    if (isChecked) {
      // Add service to selected services
      setSelectedServices([...selectedServices, serviceId]);

      // Update form data with all service IDs
      setFormData((prev) => ({
        ...prev,
        serviceIds: [...prev.serviceIds, serviceId],
      }));
    } else {
      // Remove service from selected services
      setSelectedServices(selectedServices.filter((id) => id !== serviceId));

      // Update form data without the removed service
      setFormData((prev) => ({
        ...prev,
        serviceIds: prev.serviceIds.filter((id) => id !== serviceId),
      }));
    }

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
    if (
      !formData.fullName ||
      !formData.phone ||
      selectedServices.length === 0 ||
      !formData.bookingDate ||
      !formData.startTime ||
      !formData.staffId
    ) {
      setError("Vui lòng điền đầy đủ thông tin");
      message.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, submitting: true }));

      // Get user ID (customerId) from redux store
      const customerId = user?.id;

      if (!customerId) {
        setError("Vui lòng đăng nhập để đặt lịch");
        message.error("Vui lòng đăng nhập để đặt lịch");
        setLoading((prev) => ({ ...prev, submitting: false }));
        return;
      }

      // Double check that the specialistId is from our list of specialists
      const selectedSpecialist = specialists.find(
        (s) => s.id === formData.staffId
      );
      if (!selectedSpecialist) {
        setError("Chuyên viên không hợp lệ. Vui lòng chọn lại.");
        message.error("Chuyên viên không hợp lệ. Vui lòng chọn lại.");
        setLoading((prev) => ({ ...prev, submitting: false }));
        return;
      }

      // Validate all selected services
      const selectedServiceObjects = selectedServices
        .map((serviceId) => services.find((s) => s.id === serviceId))
        .filter(Boolean);

      if (selectedServiceObjects.length !== selectedServices.length) {
        setError("Có dịch vụ không hợp lệ. Vui lòng chọn lại.");
        message.error("Có dịch vụ không hợp lệ. Vui lòng chọn lại.");
        setLoading((prev) => ({ ...prev, submitting: false }));
        return;
      }

      // Calculate total price from all selected services
      const totalPrice = String(
        selectedServiceObjects.reduce(
          (total, service) => total + (service.price || 0),
          0
        )
      );

      // Calculate total duration in minutes
      const totalDurationMinutes = selectedServiceObjects.reduce(
        (total, service) => total + (service.duration || 60),
        0
      );

      // Calculate end time based on total duration
      let endTime = formData.startTime;
      const [startHours, startMinutes] = formData.startTime
        .split(":")
        .map(Number);
      const totalMinutes =
        startHours * 60 + startMinutes + totalDurationMinutes;
      const endHours = Math.floor(totalMinutes / 60) % 24;
      const endMinutes = totalMinutes % 60;
      endTime = `${endHours.toString().padStart(2, "0")}:${endMinutes
        .toString()
        .padStart(2, "0")}`;

      // Cập nhật thông tin người dùng trong localStorage nếu họ tên hoặc số điện thoại đã thay đổi
      if (
        userData &&
        (userData.fullName !== formData.fullName ||
          userData.phone !== formData.phone)
      ) {
        try {
          const updatedUserData = {
            ...userData,
            fullName: formData.fullName,
            phone: formData.phone,
          };
          localStorage.setItem("user", JSON.stringify(updatedUserData));

          // Nếu có ID người dùng, cập nhật thông tin lên server (không chờ đợi kết quả)
          if (userData.id) {
            UserService.updateUserInfo(
              userData.id,
              {
                fullName: formData.fullName,
                phone: formData.phone,
              },
              user?.access_token
            ).catch((err) =>
              console.warn("Không thể cập nhật thông tin người dùng:", err)
            );
          }
        } catch (error) {
          console.warn(
            "Không thể cập nhật thông tin người dùng trong localStorage:",
            error
          );
        }
      }

      // Create booking data that matches the backend BookingRequest model exactly
      const bookingData = {
        customerId: String(customerId),
        staffId: String(formData.staffId),
        serviceIds: selectedServices.map((id) => String(id)),
        bookingDate: formData.bookingDate,
        startTime: formData.startTime,
        endTime: endTime,
        totalPrice: totalPrice,
        notes: formData.notes || "",
        // Thêm thông tin họ tên và số điện thoại
        fullName: formData.fullName,
        phone: formData.phone,
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
          customerPhone: formData.phone,
        };
        setSuccessData(updatedSuccessData);
        // Reset the countdown to 10 seconds
        setCountdown(10);
      } else {
        // Handle specific errors
        if (
          response.error &&
          (response.error.includes("not a specialist") ||
            response.error.includes("chuyên viên") ||
            response.reason === "SPECIALIST_ERROR")
        ) {
          setError(
            "Người bạn chọn không phải là chuyên viên. Vui lòng chọn một chuyên viên khác."
          );
          message.error(
            "Người bạn chọn không phải là chuyên viên. Vui lòng chọn một chuyên viên khác."
          );
        } else if (
          response.status === 409 ||
          response.reason === "TIME_CONFLICT" ||
          response.reason === "STAFF_CONFLICT"
        ) {
          setError(
            "Chuyên viên đã có lịch hẹn vào giờ này. Vui lòng chọn thời gian khác."
          );
          message.error(
            "Chuyên viên đã có lịch hẹn vào giờ này. Vui lòng chọn thời gian khác."
          );

          // Lưu thông tin xung đột thời gian để hiển thị
          if (response.conflictData || response.conflictingBooking) {
            setConflictData(
              response.conflictData || response.conflictingBooking
            );
          } else {
            // Tạo dữ liệu xung đột cơ bản nếu không có thông tin chi tiết
            setConflictData({
              staffName:
                selectedSpecialist.fullName ||
                selectedSpecialist.name ||
                `${selectedSpecialist.firstName || ""} ${
                  selectedSpecialist.lastName || ""
                }`.trim(),
              bookingDate: formData.bookingDate,
              startTime: formData.startTime,
              endTime: endTime,
              status: "Đã đặt",
            });
          }
        } else if (
          response.status === 400 ||
          response.reason === "INVALID_DATA" ||
          response.reason === "INVALID_BOOKING"
        ) {
          setError(
            response.error ||
              "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin."
          );
          message.error(
            response.error ||
              "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin."
          );
        } else if (
          response.status === 404 ||
          response.reason === "RESOURCE_NOT_FOUND" ||
          response.reason === "NOT_FOUND"
        ) {
          setError(
            response.error || "Không tìm thấy thông tin. Vui lòng thử lại."
          );
          message.error(
            response.error || "Không tìm thấy thông tin. Vui lòng thử lại."
          );
        } else {
          setError(
            response.error || "Đặt lịch thất bại. Vui lòng thử lại sau."
          );
          message.error(
            response.error || "Đặt lịch thất bại. Vui lòng thử lại sau."
          );
        }
      }
    } catch (error) {
      console.error("Booking error:", error);
      setError("Đã xảy ra lỗi khi đặt lịch. Vui lòng thử lại sau.");
      message.error("Đã xảy ra lỗi khi đặt lịch. Vui lòng thử lại sau.");
    } finally {
      setLoading((prev) => ({ ...prev, submitting: false }));
    }
  };

  // Add a useEffect to handle the countdown timer
  useEffect(() => {
    let timer;
    if (successData && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (successData && countdown === 0) {
      navigate("/profile");
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [successData, countdown, navigate]);

  // Render success confirmation
  if (successData) {
    return (
      <BookingSuccess 
        successData={successData} 
        formData={formData} 
        countdown={countdown} 
        services={services} 
        selectedServices={selectedServices} 
      />
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
          <ConflictInfo conflictData={conflictData} />

          {/* Service selection */}
          <ServiceSelection 
            selectedServices={selectedServices} 
            onServiceChange={handleServiceChange}
          />

          {/* Customer information */}
          <CustomerInfo formData={formData} handleChange={handleChange} />

          {/* Date and time selection */}
          <DateTimeSelection 
            formData={formData} 
            handleChange={handleChange} 
            loading={loading}
            bookedTimeSlots={bookedTimeSlots}
          />

          {/* Specialist selection */}
          <SpecialistSelection 
            formData={formData}
            handleChange={handleChange}
            specialists={specialists}
            loading={loading}
            bookedTimeSlots={bookedTimeSlots}
          />

          {/* Notes */}
          <Notes formData={formData} handleChange={handleChange} />

          {/* Submit button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="w-2/3 py-3 bg-[var(--primary-color)] text-white rounded-lg transition-colors text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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
