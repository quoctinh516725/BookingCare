import React from "react";
import { AppointmentProvider } from "./contexts/AppointmentContext";
import AppointmentFilters from "./components/appointments/AppointmentFilters";
import AppointmentTable from "./components/appointments/AppointmentTable";
import AppointmentDetailModal from "./components/appointments/AppointmentDetailModal";

const Appointments = () => {
  return (
    <AppointmentProvider>
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h1 className="text-xl font-bold mb-6">Quản lý lịch đặt</h1>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
            <AppointmentFilters />
            <AppointmentTable />
          </div>

          <AppointmentDetailModal />
        </div>
      </div>
    </AppointmentProvider>
  );
};

export default Appointments;
