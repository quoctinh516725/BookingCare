import React from 'react';
import PropTypes from 'prop-types';
import usePermission, { useAnyPermission, useAllPermissions } from '../../hooks/usePermission';

/**
 * Component bảo vệ UI dựa trên quyền của người dùng
 * @param {Object} props - Component props
 * @param {string|string[]} props.permission - Mã quyền đơn lẻ hoặc mảng các mã quyền
 * @param {boolean} props.requireAll - Nếu true, yêu cầu người dùng có tất cả các quyền trong mảng (AND logic)
 * @param {React.ReactNode} props.children - Nội dung UI được bảo vệ
 * @param {React.ReactNode} props.fallback - Nội dung hiển thị khi không có quyền (mặc định: null, nghĩa là ẩn hoàn toàn)
 * @returns {React.ReactNode|null} - UI được bảo vệ hoặc fallback nếu không có quyền
 */
const PermissionGuard = ({ permission, requireAll = false, children, fallback = null }) => {
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
    // Kiểm tra nhiều quyền
    hasAccess = requireAll ? hasAllPermissions : hasAnyPermission;
  } else {
    // Kiểm tra một quyền duy nhất
    hasAccess = hasSinglePermission;
  }
  
  return hasAccess ? children : fallback;
};

PermissionGuard.propTypes = {
  permission: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
  ]).isRequired,
  requireAll: PropTypes.bool,
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node
};

export default PermissionGuard; 