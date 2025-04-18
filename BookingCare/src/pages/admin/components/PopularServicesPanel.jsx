import React, { memo } from 'react';
import PropTypes from 'prop-types';

const PopularServicesPanel = memo(({ services, distribution }) => {
  if (!services || services.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        Chưa có dữ liệu về dịch vụ phổ biến
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 text-sm font-medium text-gray-500 mb-2">
        <div>Tên dịch vụ</div>
        <div className="text-center">Số lượt đặt</div>
        <div className="text-right">Doanh thu</div>
      </div>

      {services.map((service, index) => (
        <div
          key={index}
          className="grid grid-cols-3 items-center py-2 border-b border-gray-100"
        >
          <div className="font-medium">{service.name}</div>
          <div className="text-center">{service.count}</div>
          <div className="text-right font-medium">
            {service.revenue}
          </div>
        </div>
      ))}

      {distribution && distribution.length > 0 && (
        <div className="mt-6">
          {distribution.map((item, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>{item.name}</span>
                <span>{item.percentage}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: "#ec4899",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

PopularServicesPanel.propTypes = {
  services: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
      revenue: PropTypes.string.isRequired
    })
  ).isRequired,
  distribution: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      percentage: PropTypes.number.isRequired
    })
  ).isRequired
};

PopularServicesPanel.displayName = 'PopularServicesPanel';

export default PopularServicesPanel; 