import React from 'react';
import PropTypes from 'prop-types';
import PermissionGuard from './PermissionGuard';

/**
 * HOC để bọc component với kiểm tra quyền
 * @param {React.ComponentType} Component - Component cần bảo vệ
 * @param {Object} options - Tùy chọn cho việc bảo vệ component
 * @param {string|string[]} options.permission - Permission code đơn lẻ hoặc mảng permissions
 * @param {boolean} options.requireAll - Nếu true, yêu cầu tất cả permissions (AND logic)
 * @param {React.ReactNode} options.fallback - Component hiển thị khi không có quyền
 * @returns {React.ComponentType} - Component mới đã được bảo vệ
 */
const withPermission = (Component, { permission, requireAll = false, fallback = null }) => {
  const WithPermissionComponent = (props) => (
    <PermissionGuard 
      permission={permission} 
      requireAll={requireAll} 
      fallback={fallback}
    >
      <Component {...props} />
    </PermissionGuard>
  );

  WithPermissionComponent.displayName = `WithPermission(${Component.displayName || Component.name || 'Component'})`;
  
  return WithPermissionComponent;
};

withPermission.propTypes = {
  Component: PropTypes.elementType.isRequired,
  options: PropTypes.shape({
    permission: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string)
    ]).isRequired,
    requireAll: PropTypes.bool,
    fallback: PropTypes.node
  }).isRequired
};

export default withPermission; 