import React from "react";
import AppointmentStatusBadge from "./AppointmentStatusBadge";
import PaymentStatusBadge from "./PaymentStatusBadge";
import { useAppointments } from "../../contexts/AppointmentContext";

const AppointmentRow = ({ appointment }) => {
  const { 
    paymentStatuses, 
    formatDateTime, 
    updateAppointmentStatus, 
    setSelectedAppointment 
  } = useAppointments();

  const handleOpenDetails = () => {
    setSelectedAppointment(appointment);
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900">
          {appointment.customerName}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900">{appointment.customerEmail}</div>
        <div className="text-sm text-gray-500">{appointment.customerPhone}</div>
      </td>
      <td className="px-6 py-4 line-clamp-2">
        {appointment.services?.map((s) => s.name).join(", ") ||
          "Chưa có dịch vụ"}
      </td>
      <td className="px-6 py-4">{appointment.staffName}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        {appointment.formattedDateTime ||
          formatDateTime(appointment.bookingDate, appointment.startTime)}
      </td>
      <td className="px-6 py-4">
        <AppointmentStatusBadge status={appointment.status} />
      </td>
      <td className="px-6 py-4">
        <PaymentStatusBadge status={paymentStatuses[appointment.id]} />
      </td>
      <td className="px-6 py-4">
        {appointment.status === "PENDING" ? (
          <div className="flex space-x-2 items-center whitespace-nowrap">
            <span
              className="text-blue-500 hover:text-blue-700 bg-blue-100 hover:bg-blue-200 p-1 rounded cursor-pointer"
              onClick={() => updateAppointmentStatus(appointment.id, "CONFIRMED")}
            >
              <i className="fas fa-check"></i> Xác nhận
            </span>
            <span
              className="text-red-500 hover:text-red-700 bg-red-100 hover:bg-red-200 p-1 rounded cursor-pointer"
              onClick={() => updateAppointmentStatus(appointment.id, "CANCELLED")}
            >
              <i className="fas fa-times"></i> Hủy
            </span>
            <span
              className="text-black hover:opacity-80 p-1 rounded cursor-pointer"
              onClick={handleOpenDetails}
            >
              <i className="fas fa-info-circle"></i> Chi tiết
            </span>
          </div>
        ) : appointment.status === "CONFIRMED" ? (
          <div className="flex space-x-2 items-center">
            <span
              className="text-green-500 hover:text-green-700 bg-green-100 hover:bg-green-200 p-1 rounded cursor-pointer"
              onClick={() => updateAppointmentStatus(appointment.id, "COMPLETED")}
            >
              <i className="fas fa-check"></i> Hoàn thành
            </span>
            <span
              className="text-black hover:opacity-80 p-1 rounded cursor-pointer"
              onClick={handleOpenDetails}
            >
              <i className="fas fa-info-circle"></i> Chi tiết
            </span>
          </div>
        ) : (
          <span
            className="text-black hover:opacity-80 p-1 rounded cursor-pointer"
            onClick={handleOpenDetails}
          >
            <i className="fas fa-info-circle"></i> Chi tiết
          </span>
        )}
      </td>
    </tr>
  );
};

export default React.memo(AppointmentRow); 