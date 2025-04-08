import React from 'react';
import PropTypes from 'prop-types';
import usePermission, { useAnyPermission, useAllPermissions } from '../../hooks/usePermission';
import { LockOutlined } from '@ant-design/icons';

/**
 * Component bảo vệ UI dựa trên quyền của người dùng
 * @param {Object} props - Component props
 * @param {string|string[]} props.permission - Mã quyền đơn lẻ hoặc mảng các mã quyền
 * @param {boolean} props.requireAll - Nếu true, yêu cầu người dùng có tất cả các quyền trong mảng (AND logic)
 * @param {React.ReactNode} props.children - Nội dung UI được bảo vệ
 * @returns {React.ReactNode} - UI được bảo vệ với icon khóa nếu không có quyền
 */
const PermissionGuard = ({ 
  permission, 
  requireAll = false, 
  children
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
    return children;
  }

  // Clone children và thêm thuộc tính disabled vào tất cả các phần tử có thể tương tác
  const disabledChildren = React.Children.map(children, child => {
    if (!React.isValidElement(child)) return child;

    // Tạo một bản sao của child với thuộc tính disabled
    const newProps = {
      ...child.props,
      disabled: true,
      style: { ...child.props.style, pointerEvents: 'none', opacity: 0.5 }
    };

    return React.cloneElement(child, newProps);
  });

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {disabledChildren}
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

PermissionGuard.propTypes = {
  permission: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
  ]).isRequired,
  requireAll: PropTypes.bool,
  children: PropTypes.node.isRequired
};

export default PermissionGuard; 