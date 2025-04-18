import React, { memo } from 'react';
import PropTypes from 'prop-types';

const AppointmentsTable = memo(({ appointments, renderStatus }) => {
  if (!appointments || appointments.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        Chưa có lịch đặt nào
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-white">
          <tr>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider"
            >
              Khách hàng
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider"
            >
              Dịch vụ
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider"
            >
              Thời gian
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider"
            >
              Trạng thái
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {appointments.map((appointment, index) => (
            <tr key={index}>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                {appointment.customer}
              </td>
              <td className="px-4 py-3 max-w-[300px] text-sm text-gray-900">
                {appointment.service}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                {appointment.time}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm">
                {renderStatus(appointment.status)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

AppointmentsTable.propTypes = {
  appointments: PropTypes.arrayOf(
    PropTypes.shape({
      customer: PropTypes.string.isRequired,
      service: PropTypes.string.isRequired,
      time: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired
    })
  ).isRequired,
  renderStatus: PropTypes.func.isRequired
};

AppointmentsTable.displayName = 'AppointmentsTable';

export default AppointmentsTable; 