import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import usePermission, { useAnyPermission, useAllPermissions } from '../../hooks/usePermission';

/**
 * Button component được bảo vệ bởi quyền người dùng
 * @param {Object} props - Component props
 * @param {string|string[]} props.permission - Mã quyền đơn lẻ hoặc mảng các mã quyền
 * @param {boolean} props.requireAll - Nếu true, yêu cầu người dùng có tất cả các quyền trong mảng
 * @param {string} props.className - CSS classes cho button
 * @param {Function} props.onClick - Xử lý sự kiện click
 * @param {React.ReactNode} props.children - Nội dung của button
 * @param {Object} props.rest - Các props khác của button
 * @returns {React.ReactNode} - Button component với icon khóa nếu không có quyền
 */
const PermissionButton = ({
  permission,
  requireAll = false,
  className = '',
  onClick,
  children,
  ...rest
}) => {
  const singlePermission = Array.isArray(permission) ? '' : permission;
  const permissionArray = Array.isArray(permission) ? permission : [];
  
  const hasSinglePermission = usePermission(singlePermission);
  const hasAnyPermission = useAnyPermission(permissionArray);
  const hasAllPermissions = useAllPermissions(permissionArray);
  
  let hasAccess = false;
  
  if (Array.isArray(permission)) {
    hasAccess = requireAll ? hasAllPermissions : hasAnyPermission;
  } else {
    hasAccess = hasSinglePermission;
  }

  if (hasAccess) {
    return (
      <Button
        className={className}
        onClick={onClick}
        {...rest}
      >
        {children}
      </Button>
    );
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <Button
        className={className}
        disabled
        style={{ pointerEvents: 'none', opacity: 0.5 }}
        {...rest}
      >
        {children}
      </Button>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        pointerEvents: 'none'
      }}>
        <div style={{
          backgroundColor: '#ff4d4f',
          borderRadius: '50%',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <LockOutlined style={{ color: 'white', fontSize: '20px' }} />
        </div>
      </div>
    </div>
  );
};

PermissionButton.propTypes = {
  permission: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
  ]).isRequired,
  requireAll: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired
};

export default PermissionButton; 