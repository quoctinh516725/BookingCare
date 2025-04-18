import React from "react";

const ConflictInfo = ({ conflictData }) => {
  if (!conflictData) return null;

  return (
    <div className="bg-amber-50 border border-amber-300 text-amber-800 p-4 rounded-md mb-4">
      <h3 className="font-semibold mb-2">
        Chuyên viên đã có lịch hẹn vào giờ này:
      </h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <b>Chuyên viên:</b> {conflictData.staffName}
        </div>
        <div>
          <b>Trạng thái:</b>{" "}
          <span className="bg-amber-100 px-2 py-0.5 rounded-md text-amber-800">
            {conflictData.statusDescription ||
              conflictData.status ||
              "Đã đặt"}
          </span>
        </div>
        <div>
          <b>Ngày:</b> {conflictData.bookingDate}
        </div>
        <div>
          <b>Thời gian:</b> {conflictData.startTime} -{" "}
          {conflictData.endTime}
        </div>
      </div>
      <p className="mt-2 text-sm">
        Vui lòng chọn thời gian khác hoặc chuyên viên khác.
      </p>
    </div>
  );
};

export default ConflictInfo; 