# API Security & Access Control Guide

## Tổng quan về hệ thống xác thực

Hệ thống Beautiful Care API sử dụng xác thực dựa trên JWT (JSON Web Token) với hai loại token:

- **Access Token**: Thời hạn ngắn (24 giờ), dùng để xác thực các yêu cầu API
- **Refresh Token**: Thời hạn dài (7 ngày), dùng để lấy access token mới khi hết hạn

## Các quy tắc phân quyền

Hệ thống có 3 vai trò người dùng chính:

1. **ADMIN**: Có toàn quyền truy cập tất cả các tính năng
2. **STAFF**: Có quyền quản lý booking, xem thông tin dịch vụ và khách hàng
3. **CUSTOMER**: Chỉ có quyền quản lý thông tin và booking của chính mình

## Luồng xác thực

### Đăng ký và đăng nhập

1. **Đăng ký tài khoản mới**: `POST /api/v1/auth/register`
2. **Đăng nhập**: `POST /api/v1/auth/login`
3. **Làm mới token**: `POST /api/v1/auth/refresh-token`
4. **Đăng xuất**: `POST /api/v1/auth/logout`

### Sử dụng token

- Sau khi đăng nhập thành công, frontend nhận được JWT token
- Token này phải được gửi trong header của mỗi yêu cầu API:

```
Authorization: Bearer [jwt_token]
```

## Quy tắc bảo mật theo từng module

### 1. Quản lý dịch vụ (Service Management)

- **Xem danh sách dịch vụ**: Công khai, không cần xác thực
- **Thêm/Sửa/Xóa dịch vụ**: Chỉ ADMIN và STAFF

### 2. Quản lý đặt lịch (Booking Management)

- **Xem tất cả booking**: Chỉ ADMIN và STAFF
- **Xem booking theo ID**:
  - ADMIN/STAFF: Xem được tất cả
  - CUSTOMER: Chỉ xem được booking của mình
- **Tạo booking mới**: Tất cả người dùng đã đăng nhập
- **Cập nhật booking**:
  - ADMIN/STAFF: Cập nhật được tất cả
  - CUSTOMER: Chỉ cập nhật được booking của mình
- **Xóa booking**:
  - ADMIN: Xóa được tất cả
  - CUSTOMER: Chỉ xóa được booking của mình chưa được xác nhận
- **Cập nhật trạng thái booking**: Chỉ ADMIN/STAFF

### 3. Quản lý đánh giá (Feedback Management)

- **Xem tất cả feedback**: Chỉ ADMIN
- **Xem feedback theo ID**:
  - ADMIN: Xem được tất cả
  - CUSTOMER: Chỉ xem được feedback của mình
- **Tạo feedback**:
  - Chỉ có thể tạo feedback cho booking đã hoàn thành
  - Người dùng chỉ có thể tạo feedback cho booking của mình
  - Mỗi booking chỉ được tạo một feedback
- **Cập nhật feedback**:
  - ADMIN: Cập nhật được tất cả
  - CUSTOMER: Chỉ cập nhật được feedback của mình
- **Xóa feedback**: Chỉ ADMIN

## Xử lý lỗi về quyền truy cập

Hệ thống API sẽ trả về các mã lỗi HTTP và thông báo cụ thể khi có vấn đề về xác thực hoặc phân quyền:

- **401 Unauthorized**: Không có token hợp lệ hoặc token đã hết hạn
- **403 Forbidden**: Không có quyền truy cập tài nguyên
- **400 Bad Request**: Dữ liệu yêu cầu không hợp lệ
- **409 Conflict**: Tài nguyên đã tồn tại (ví dụ: đã có feedback cho booking)

## Hướng dẫn cho Frontend

### 1. Lưu trữ token

- Lưu trữ access token và refresh token trong localStorage hoặc sessionStorage
- Giải mã JWT token để lấy thông tin người dùng (userId, role, expiration)

### 2. Xử lý token hết hạn

- Khi nhận được lỗi 401, thử làm mới token bằng refresh token
- Nếu refresh token cũng không hợp lệ, chuyển hướng người dùng đến trang đăng nhập

### 3. Hiển thị UI dựa trên vai trò

- Kiểm tra vai trò người dùng từ token để hiển thị menu và chức năng phù hợp
- Ví dụ: Chỉ hiển thị nút "Quản lý người dùng" cho ADMIN

### 4. Xử lý lỗi phân quyền

- Hiển thị thông báo lỗi phù hợp khi nhận được lỗi 403
- Tránh hiển thị các tùy chọn mà người dùng không có quyền truy cập

## Ràng buộc nghiệp vụ quan trọng

1. **Đặt lịch (Booking)**:

   - Không thể đặt lịch cho ngày trong quá khứ
   - Không thể đặt lịch trùng thời gian với booking khác
   - Chỉ có thể hủy booking ở trạng thái PENDING hoặc CONFIRMED

2. **Đánh giá (Feedback)**:
   - Chỉ có thể tạo feedback cho booking đã COMPLETED
   - Mỗi booking chỉ được tạo một feedback
   - Chỉ người đặt lịch mới có thể tạo feedback cho booking đó

## Testing API

Bạn có thể sử dụng Swagger UI để test API và hiểu rõ hơn về các yêu cầu xác thực:

```
http://localhost:8080/swagger-ui.html
```