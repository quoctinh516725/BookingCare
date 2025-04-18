import React from "react";

const DateTimeSelection = ({
  formData,
  handleChange,
  loading,
  bookedTimeSlots,
}) => {
  const timeSlots = [
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
  ];

  return (
    <>
      <div className="mb-6">
        <p className="text-xl font-semibold mb-2">
          Ngày <span className="text-red-500">*</span>
        </p>
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
      
      <div className="mb-6">
        <p className="text-xl font-semibold mb-2">
          Giờ <span className="text-red-500">*</span>
        </p>

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
              <div className="grid grid-cols-4 gap-2 max-h-[200px] overflow-y-auto scrollbar-hidden">
                {timeSlots.map((time) => {
                  const isBooked = bookedTimeSlots.includes(time);
                  const isSelected = formData.startTime === time;

                  return (
                    <div
                      key={time}
                      onClick={() =>
                        !isBooked &&
                        handleChange({
                          target: { name: "startTime", value: time },
                        })
                      }
                      className={`p-2 text-center rounded cursor-pointer transition-colors ${
                        isBooked
                          ? "bg-red-100 text-red-500 font-bold cursor-not-allowed"
                          : isSelected
                          ? "bg-[var(--primary-color)] text-white font-semibold"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                    >
                      {time}
                      {isBooked && (
                        <div className="text-xs mt-1">Đã đặt</div>
                      )}
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
                <span>
                  Thời gian đã chọn: <strong>{formData.startTime}</strong>
                </span>
              </div>
            )}
          </>
        )}

        {/* Thông báo khi có khung giờ đã đặt */}
        {!loading.timeSlots && bookedTimeSlots.length > 0 && (
          <div className="text-sm text-amber-600 mt-1">
            <span className="inline-block mr-1">⚠️</span>
            <strong>
              Có {bookedTimeSlots.length} khung giờ đã được đặt
            </strong>{" "}
            và không thể chọn
          </div>
        )}
      </div>
    </>
  );
};

export default DateTimeSelection; 