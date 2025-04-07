import React from 'react';
import PropTypes from 'prop-types';
import usePermission, { useAnyPermission, useAllPermissions } from '../../hooks/usePermission';

/**
 * Button component được bảo vệ bởi quyền người dùng
 * @param {Object} props - Component props
 * @param {string|string[]} props.permission - Mã quyền đơn lẻ hoặc mảng các mã quyền
 * @param {boolean} props.requireAll - Nếu true, yêu cầu người dùng có tất cả các quyền trong mảng
 * @param {boolean} props.hideOnNoPermission - Nếu true, ẩn button khi không có quyền; nếu false, hiển thị button nhưng disable
 * @param {string} props.className - CSS classes cho button
 * @param {Function} props.onClick - Xử lý sự kiện click
 * @param {React.ReactNode} props.children - Nội dung của button
 * @param {Object} props.rest - Các props khác của button
 * @returns {React.ReactNode|null} - Button component nếu có quyền, button bị disable hoặc null nếu không có quyền
 */
const PermissionButton = ({
  permission,
  requireAll = false,
  hideOnNoPermission = true,
  className = '',
  onClick,
  children,
  ...rest
}) => {
  // Gọi tất cả hooks ở đầu component, không có điều kiện
  const singlePermission = Array.isArray(permission) ? '' : permission;
  const permissionArray = Array.isArray(permission) ? permission : [];
  
  // Gọi các hooks riêng biệt
  const hasSinglePermission = usePermission(singlePermission);
  const hasAnyPermission = useAnyPermission(permissionArray);
  const hasAllPermissions = useAllPermissions(permissionArray);
  
  // Xác định quyền truy cập dựa trên loại đầu vào
  let hasAccess = false;
  
  if (Array.isArray(permission)) {
    hasAccess = requireAll ? hasAllPermissions : hasAnyPermission;
  } else {
    hasAccess = hasSinglePermission;
  }

  // Nếu không có quyền và được cấu hình để ẩn, trả về null
  if (!hasAccess && hideOnNoPermission) {
    return null;
  }

  // Trả về button với trạng thái disabled nếu không có quyền
  return (
    <button
      className={`${className} ${!hasAccess ? 'disabled-button' : ''}`}
      onClick={hasAccess ? onClick : undefined}
      disabled={!hasAccess}
      {...rest}
    >
      {children}
    </button>
  );
};

PermissionButton.propTypes = {
  permission: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
  ]).isRequired,
  requireAll: PropTypes.bool,
  hideOnNoPermission: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired
};

export default PermissionButton; 