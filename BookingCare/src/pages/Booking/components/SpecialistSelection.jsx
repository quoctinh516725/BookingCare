import React from "react";

const SpecialistSelection = ({ formData, handleChange, specialists, loading, bookedTimeSlots }) => {
  return (
    <>
      <div className="mb-6">
        <p className="text-xl font-semibold mb-2">
          Chuyên viên <span className="text-red-500">*</span>
        </p>
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
            <option disabled>Không có chuyên viên nào</option>
          ) : (
            specialists.map((specialist) => (
              <option key={specialist.id} value={specialist.id}>
                {specialist.fullName ||
                  specialist.name ||
                  `${specialist.firstName || ""} ${
                    specialist.lastName || ""
                  }`.trim()}
                {specialist.specialty ? ` (${specialist.specialty})` : ""}
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
            {bookedTimeSlots.map((time) => (
              <span
                key={time}
                className="inline-block px-3 py-1.5 bg-amber-100 text-amber-800 rounded-md text-sm font-semibold border border-amber-200 shadow-sm"
              >
                {time}
              </span>
            ))}
          </div>
          <p className="text-sm text-amber-700 mt-3 italic">
            Các khung giờ trên đã được đặt và không thể chọn. Vui lòng chọn khung
            giờ khác hoặc chuyên viên khác.
          </p>
        </div>
      )}
    </>
  );
};

export default SpecialistSelection; 