import React from 'react';
import { PermissionGuard, PermissionButton } from './';
import usePermission from '../../hooks/usePermission';

/**
 * Component chứa các ví dụ về sử dụng các permission components
 * Đây là tài liệu hướng dẫn, không phải component thực tế
 */
const PermissionExamples = () => {
  // Ví dụ sử dụng usePermission hook
  const canCreateUser = usePermission('user:create');
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Ví dụ sử dụng Permission Components</h2>
      
      {/* Ví dụ 1: Sử dụng usePermission hook */}
      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-2">1. Sử dụng usePermission hook</h3>
        <div className="bg-gray-100 p-3 rounded">
          <pre className="text-sm">{`
const canCreateUser = usePermission('user:create');

// Sử dụng trong logic rendering hoặc xử lý
{canCreateUser && <button>Tạo người dùng mới</button>}
          `}</pre>
          
          <div className="mt-2">
            <strong>Kết quả thực tế:</strong>
            {canCreateUser ? (
              <p className="text-green-600">Bạn có quyền tạo người dùng</p>
            ) : (
              <p className="text-red-600">Bạn không có quyền tạo người dùng</p>
            )}
          </div>
        </div>
      </section>
      
      {/* Ví dụ 2: Sử dụng PermissionGuard */}
      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-2">2. Sử dụng PermissionGuard component</h3>
        <div className="bg-gray-100 p-3 rounded">
          <pre className="text-sm">{`
<PermissionGuard permission="user:create">
  <button className="btn btn-primary">Tạo người dùng</button>
</PermissionGuard>

// Với fallback content
<PermissionGuard 
  permission="service:delete" 
  fallback={<p>Bạn không có quyền xóa dịch vụ</p>}
>
  <button className="btn btn-danger">Xóa dịch vụ</button>
</PermissionGuard>

// Với nhiều quyền (OR logic)
<PermissionGuard permission={['service:update', 'service:delete']}>
  <button>Quản lý dịch vụ</button>
</PermissionGuard>

// Với nhiều quyền (AND logic)
<PermissionGuard 
  permission={['booking:create', 'service:view']} 
  requireAll={true}
>
  <button>Đặt lịch dịch vụ</button>
</PermissionGuard>
          `}</pre>
          
          <div className="mt-2">
            <strong>Kết quả thực tế:</strong>
            <div className="mt-1">
              <PermissionGuard permission="user:create">
                <button className="bg-blue-500 text-white px-3 py-1 rounded">Tạo người dùng</button>
              </PermissionGuard>
            </div>
            
            <div className="mt-1">
              <PermissionGuard 
                permission="service:delete" 
                fallback={<p className="text-red-600 text-sm">Bạn không có quyền xóa dịch vụ</p>}
              >
                <button className="bg-red-500 text-white px-3 py-1 rounded">Xóa dịch vụ</button>
              </PermissionGuard>
            </div>
          </div>
        </div>
      </section>
      
      {/* Ví dụ 3: Sử dụng PermissionButton */}
      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-2">3. Sử dụng PermissionButton component</h3>
        <div className="bg-gray-100 p-3 rounded">
          <pre className="text-sm">{`
// Button sẽ ẩn nếu không có quyền
<PermissionButton 
  permission="service:create"
  onClick={() => console.log('Tạo dịch vụ')}
  className="btn btn-primary"
>
  Tạo dịch vụ mới
</PermissionButton>

// Button sẽ disable nhưng vẫn hiển thị nếu không có quyền
<PermissionButton 
  permission="booking:update"
  hideOnNoPermission={false}
  onClick={() => console.log('Cập nhật lịch hẹn')}
  className="btn btn-secondary"
>
  Cập nhật lịch hẹn
</PermissionButton>
          `}</pre>
          
          <div className="mt-2">
            <strong>Kết quả thực tế:</strong>
            <div className="mt-1">
              <PermissionButton 
                permission="service:create"
                onClick={() => console.log('Tạo dịch vụ')}
                className="bg-blue-500 text-white px-3 py-1 rounded"
              >
                Tạo dịch vụ mới
              </PermissionButton>
            </div>
            
            <div className="mt-1">
              <PermissionButton 
                permission="booking:update"
                hideOnNoPermission={false}
                onClick={() => console.log('Cập nhật lịch hẹn')}
                className="bg-gray-500 text-white px-3 py-1 rounded"
              >
                Cập nhật lịch hẹn
              </PermissionButton>
            </div>
          </div>
        </div>
      </section>
      
      {/* Ví dụ 4: Sử dụng withPermission HOC */}
      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-2">4. Sử dụng withPermission HOC</h3>
        <div className="bg-gray-100 p-3 rounded">
          <pre className="text-sm">{`
// Bọc component với quyền
const ProtectedAdminPanel = withPermission(AdminPanel, {
  permission: 'admin:access',
  fallback: <AccessDeniedPage />
});

// Sử dụng trong routes
<Route path="/admin" element={<ProtectedAdminPanel />} />

// Bọc component với nhiều quyền (OR logic)
const ProtectedUserManagement = withPermission(UserManagement, {
  permission: ['user:view', 'user:manage']
});

// Bọc component với nhiều quyền (AND logic) 
const ProtectedReports = withPermission(Reports, {
  permission: ['report:view', 'data:access'],
  requireAll: true
});
          `}</pre>
        </div>
      </section>
      
      {/* Ví dụ 5: Kết hợp với các thành phần UI khác */}
      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-2">5. Kết hợp với Menu và Navigation</h3>
        <div className="bg-gray-100 p-3 rounded">
          <pre className="text-sm">{`
// Trong menu component
const Menu = () => {
  return (
    <nav>
      <ul>
        <li><Link to="/">Trang chủ</Link></li>
        
        <PermissionGuard permission="user:view">
          <li><Link to="/users">Quản lý người dùng</Link></li>
        </PermissionGuard>
        
        <PermissionGuard permission="service:view">
          <li><Link to="/services">Quản lý dịch vụ</Link></li>
        </PermissionGuard>
        
        <PermissionGuard permission="booking:view">
          <li><Link to="/bookings">Quản lý lịch hẹn</Link></li>
        </PermissionGuard>
        
        <PermissionGuard permission="report:view">
          <li><Link to="/reports">Báo cáo</Link></li>
        </PermissionGuard>
      </ul>
    </nav>
  );
};
          `}</pre>
          
          <div className="mt-2">
            <strong>Kết quả thực tế:</strong>
            <nav className="mt-1 border border-gray-300 p-2 rounded">
              <ul className="flex space-x-4">
                <li><a href="#" className="text-blue-500">Trang chủ</a></li>
                
                <PermissionGuard permission="user:view">
                  <li><a href="#" className="text-blue-500">Quản lý người dùng</a></li>
                </PermissionGuard>
                
                <PermissionGuard permission="service:view">
                  <li><a href="#" className="text-blue-500">Quản lý dịch vụ</a></li>
                </PermissionGuard>
                
                <PermissionGuard permission={['booking:view', 'booking:manage']}>
                  <li><a href="#" className="text-blue-500">Quản lý lịch hẹn</a></li>
                </PermissionGuard>
              </ul>
            </nav>
          </div>
        </div>
      </section>
      
      {/* Ví dụ 6: Tích hợp với form */}
      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-2">6. Tích hợp với Form</h3>
        <div className="bg-gray-100 p-3 rounded">
          <pre className="text-sm">{`
const UserForm = () => {
  // Form state và logic ở đây...
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <input name="name" placeholder="Tên" />
      <input name="email" placeholder="Email" />
      
      {/* Chỉ hiển thị trường role nếu có quyền */}
      <PermissionGuard permission="user:manage-roles">
        <div className="form-group">
          <label>Vai trò</label>
          <select name="role">
            <option value="user">Người dùng</option>
            <option value="staff">Nhân viên</option>
            <option value="admin">Quản trị viên</option>
          </select>
        </div>
      </PermissionGuard>
      
      {/* Chỉ hiển thị nút lưu nếu có quyền */}
      <PermissionButton 
        permission="user:update" 
        type="submit"
        className="btn btn-primary"
      >
        Lưu thay đổi
      </PermissionButton>
    </form>
  );
};
          `}</pre>
        </div>
      </section>

      {/* Ví dụ 7: Thực tế - kết hợp nhiều điều kiện */}
      <section className="mb-6">
        <h3 className="text-lg font-semibold mb-2">7. Tùy chỉnh logic phức tạp</h3>
        <div className="bg-gray-100 p-3 rounded">
          <pre className="text-sm">{`
// Logic phức tạp kết hợp nhiều điều kiện
const UserDetailPage = ({ userId }) => {
  // Hooks để kiểm tra quyền
  const canViewUser = usePermission('user:view');
  const canEditUser = usePermission('user:update');
  const canDeleteUser = usePermission('user:delete');
  const isCreator = userId === currentUserId;
  
  // Kết hợp nhiều điều kiện
  const canEdit = canEditUser || isCreator;
  
  // Logic hiển thị
  return (
    <div>
      {canViewUser ? (
        <>
          <UserInfo userId={userId} />
          
          <div className="actions">
            {canEdit && (
              <button onClick={handleEdit}>Chỉnh sửa</button>
            )}
            
            <PermissionGuard 
              permission="user:delete"
              fallback={isCreator ? <button>Hủy tài khoản</button> : null}
            >
              <button onClick={handleDelete}>Xóa người dùng</button>
            </PermissionGuard>
          </div>
        </>
      ) : (
        <p>Bạn không có quyền xem thông tin này</p>
      )}
    </div>
  );
};
          `}</pre>
        </div>
      </section>
    </div>
  );
};

export default PermissionExamples; 