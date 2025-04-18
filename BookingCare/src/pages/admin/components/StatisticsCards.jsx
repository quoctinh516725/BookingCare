import React, { memo } from 'react';
import PropTypes from 'prop-types';

const StatisticsCards = memo(({ statistics }) => {
  if (!statistics || statistics.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-md shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {statistics.map((stat, index) => (
        <div key={index} className="bg-white p-4 rounded-md shadow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-gray-500 text-sm">{stat.title}</h3>
            <div className="text-gray-400">
              {stat.iconName && (
                <i className={`${stat.iconName} h-5 w-5 ${stat.iconColor || ''}`}></i>
              )}
            </div>
          </div>
          <div className="font-bold text-2xl mb-1">{stat.value}</div>
          <div
            className={`text-xs ${
              stat.change.includes("+")
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {stat.change}
          </div>
        </div>
      ))}
    </div>
  );
});

StatisticsCards.propTypes = {
  statistics: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      change: PropTypes.string.isRequired,
      iconName: PropTypes.string,
      iconColor: PropTypes.string
    })
  ).isRequired
};

StatisticsCards.displayName = 'StatisticsCards';

export default StatisticsCards; 