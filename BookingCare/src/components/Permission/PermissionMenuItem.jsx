import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import PermissionGuard from './PermissionGuard';

/**
 * Component tạo menu item với kiểm tra quyền
 * @param {Object} props - Component props
 * @param {string|string[]} props.permission - Mã quyền đơn lẻ hoặc mảng các mã quyền
 * @param {boolean} props.requireAll - Nếu true, yêu cầu người dùng có tất cả các quyền trong mảng (AND logic)
 * @param {string} props.to - Đường dẫn đến route đích
 * @param {string|React.ReactNode} props.icon - Icon string (như "fas fa-user") hoặc component icon
 * @param {string} props.className - Class CSS cho menu item
 * @param {React.ReactNode} props.children - Nội dung của menu item
 * @returns {React.ReactNode|null} - Menu item nếu có quyền, null nếu không
 */
const PermissionMenuItem = ({
  permission,
  requireAll = false,
  to,
  icon,
  className = '',
  onClick,
  children,
  ...rest
}) => {
  // Render icon based on type (string or node)
  const renderIcon = () => {
    if (!icon) return null;
    
    if (typeof icon === 'string') {
      // If icon is a string, render as Font Awesome icon
      return <i className={`${icon} menu-item-icon mr-2`}></i>;
    }
    
    // If icon is a React node, render as is
    return <span className="menu-item-icon mr-2">{icon}</span>;
  };

  return (
    <PermissionGuard permission={permission} requireAll={requireAll}>
      <li className="menu-item">
        <Link
          to={to}
          className={`flex items-center py-2 px-3 hover:bg-gray-100 rounded ${className}`}
          onClick={onClick}
          {...rest}
        >
          {renderIcon()}
          <span className="menu-item-text">{children}</span>
        </Link>
      </li>
    </PermissionGuard>
  );
};

PermissionMenuItem.propTypes = {
  permission: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
  ]).isRequired,
  requireAll: PropTypes.bool,
  to: PropTypes.string.isRequired,
  icon: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.node
  ]),
  className: PropTypes.string,
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired
};

export default PermissionMenuItem; 