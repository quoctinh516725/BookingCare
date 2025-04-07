import React from 'react';
import { Link } from 'react-router-dom';
import { PermissionGuard, PermissionMenuItem } from '../Permission';

/**
 * Sidebar menu component cho trang admin dựa trên hệ thống phân quyền
 * Chỉ hiển thị các mục menu mà người dùng có quyền truy cập
 */
const AdminPermissionMenu = () => {
  return (
    <div className="admin-sidebar">
      <div className="sidebar-header">
        <Link to="/admin" className="brand-logo">
          <img src="/logo.png" alt="BookingCare" className="w-8 h-8" />
          <span className="ml-2 font-bold text-lg">BookingCare</span>
        </Link>
      </div>

      <nav className="sidebar-nav mt-6">
        <ul className="menu-list">
          {/* Trang tổng quan luôn hiển thị */}
          <li className="menu-item">
            <Link to="/admin" className="menu-link">
              <i className="fas fa-chart-pie menu-icon mr-2"></i>
              <span className="menu-text">Tổng quan</span>
            </Link>
          </li>

          {/* Quản lý người dùng - Yêu cầu quyền user:view */}
          <PermissionMenuItem
            permission="user:view"
            to="/admin/users"
            icon="fas fa-users"
          >
            Quản lý người dùng
          </PermissionMenuItem>

          {/* Quản lý nhân viên - Yêu cầu quyền user:view và staff:view */}
          <PermissionMenuItem
            permission={['user:view', 'staff:view']}
            requireAll={true}
            to="/admin/staff"
            icon="fas fa-user-tie"
          >
            Quản lý nhân viên
          </PermissionMenuItem>

          {/* Quản lý dịch vụ - Yêu cầu quyền service:view */}
          <PermissionMenuItem
            permission="service:view"
            to="/admin/services"
            icon="fas fa-spa"
          >
            Quản lý dịch vụ
          </PermissionMenuItem>

          {/* Quản lý lịch hẹn - Yêu cầu quyền booking:view */}
          <PermissionMenuItem
            permission="booking:view"
            to="/admin/bookings"
            icon="fas fa-calendar-alt"
          >
            Quản lý lịch hẹn
          </PermissionMenuItem>

          {/* Quản lý chuyên khoa - Yêu cầu quyền specialist:view */}
          <PermissionMenuItem
            permission="specialist:view"
            to="/admin/specialists"
            icon="fas fa-stethoscope"
          >
            Quản lý chuyên khoa
          </PermissionMenuItem>

          {/* Quản lý bài viết - Yêu cầu quyền blog:view */}
          <PermissionMenuItem
            permission="blog:view"
            to="/admin/blogs"
            icon="fas fa-newspaper"
          >
            Quản lý bài viết
          </PermissionMenuItem>

          {/* Phần quản lý phân quyền - Chỉ dành cho Admin */}
          <PermissionGuard permission={['permission:view', 'permission_group:view']}>
            <li className="menu-section">
              <span className="section-title">Quản lý phân quyền</span>
            </li>

            <PermissionMenuItem
              permission="permission:view"
              to="/admin/permission"
              icon="fas fa-key"
            >
              Quyền hệ thống
            </PermissionMenuItem>

            <PermissionMenuItem
              permission="permission_group:view"
              to="/admin/permission/groups"
              icon="fas fa-layer-group"
            >
              Nhóm quyền
            </PermissionMenuItem>

            <PermissionMenuItem
              permission="user_permission:view"
              to="/admin/permission/users"
              icon="fas fa-user-shield"
            >
              Phân quyền người dùng
            </PermissionMenuItem>
          </PermissionGuard>

          {/* Cài đặt hệ thống - Chỉ dành cho Admin */}
          <PermissionGuard permission="admin:access">
            <li className="menu-section">
              <span className="section-title">Hệ thống</span>
            </li>

            <PermissionMenuItem
              permission="system:settings"
              to="/admin/settings"
              icon="fas fa-cog"
            >
              Cài đặt
            </PermissionMenuItem>

            <PermissionMenuItem
              permission="system:logs"
              to="/admin/logs"
              icon="fas fa-clipboard-list"
            >
              Nhật ký hệ thống
            </PermissionMenuItem>
          </PermissionGuard>
        </ul>
      </nav>
    </div>
  );
};

export default AdminPermissionMenu; 