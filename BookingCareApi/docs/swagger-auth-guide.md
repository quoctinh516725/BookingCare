# Hướng dẫn xác thực với Swagger UI

## Giới thiệu

Hệ thống Beautiful Care API sử dụng JWT (JSON Web Token) để xác thực người dùng. Khi sử dụng Swagger UI để thử nghiệm API, bạn cần thực hiện xác thực trước khi có thể gọi các API yêu cầu quyền admin hoặc quyền người dùng đã đăng nhập.

## Các tài khoản mẫu có sẵn

Hệ thống đã được cấu hình với các tài khoản mẫu sau đây:

| Tài khoản | Mật khẩu | Vai trò | Mô tả |
|-----------|----------|---------|-------|
| admin | admin123 | ADMIN | Có quyền truy cập tất cả các API trong hệ thống |
| specialist | specialist123 | SPECIALIST | Chuyên gia thực hiện các dịch vụ |
| customer | customer123 | CUSTOMER | Khách hàng sử dụng dịch vụ |
| content | content123 | CONTENT_CREATOR | Người tạo nội dung blog |

## Các bước xác thực

### 1. Truy cập Swagger UI

Truy cập Swagger UI tại địa chỉ sau khi khởi động ứng dụng:

```
http://localhost:8080/swagger-ui/index.html
```

### 2. Đăng nhập để lấy token

1. Mở phần **User Management** trong Swagger UI
2. Chọn endpoint `/api/v1/users/auth/login`
3. Nhấp vào nút "Try it out"
4. Nhập thông tin đăng nhập, ví dụ:

```json
{
  "username": "admin",
  "password": "admin123"
}
```

5. Nhấp vào nút "Execute"
6. Kiểm tra kết quả trả về, bạn sẽ nhận được token JWT và thông tin người dùng:

```json
{
  "status": "SUCCESS",
  "message": "Authentication successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userId": "admin-user-id",
    "username": "admin",
    "role": "ADMIN"
  }
}
```

7. Sao chép token từ phản hồi (chuỗi bắt đầu bằng "eyJ...")

### 3. Cấu hình Token vào Swagger UI

1. Nhấp vào nút "Authorize" ở đầu trang Swagger UI
2. Trong hộp thoại hiện ra, nhập token vào trường Bearer Authentication với định dạng:

```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Lưu ý: Phải nhập từ khóa "Bearer " (có dấu cách) trước chuỗi token.

3. Nhấp vào nút "Authorize"
4. Nhấp vào nút "Close"

Bây giờ, tất cả các yêu cầu API sẽ tự động bao gồm token này trong header Authorization.

## Sử dụng API với các quyền khác nhau

### Đăng nhập với vai trò ADMIN
1. Đăng nhập với tài khoản `admin/admin123`
2. Admin có quyền truy cập vào tất cả các API bao gồm:
   - Quản lý người dùng
   - Quản lý dịch vụ
   - Quản lý chuyên gia
   - Quản lý blog
   - Quản lý đặt lịch

### Đăng nhập với vai trò SPECIALIST
1. Đăng nhập với tài khoản `specialist/specialist123`
2. Chuyên gia có thể truy cập:
   - Xem lịch làm việc
   - Quản lý các cuộc hẹn được phân công
   - Cập nhật thông tin cá nhân

### Đăng nhập với vai trò CUSTOMER
1. Đăng nhập với tài khoản `customer/customer123`
2. Khách hàng có thể truy cập:
   - Xem dịch vụ
   - Đặt lịch
   - Quản lý cuộc hẹn của mình
   - Thực hiện skin test

### Đăng nhập với vai trò CONTENT_CREATOR
1. Đăng nhập với tài khoản `content/content123`
2. Người tạo nội dung có thể truy cập:
   - Quản lý bài viết blog
   - Quản lý danh mục blog

## Thêm dịch vụ mới (ADMIN)

Sau khi đăng nhập với tài khoản admin và cấu hình token, bạn có thể thêm dịch vụ mới như sau:

1. Mở phần **Service Management** trong Swagger UI
2. Chọn endpoint `/api/v1/services`
3. Nhấp vào nút "Try it out"
4. Nhập thông tin dịch vụ mới, ví dụ:

```json
{
  "name": "Tên dịch vụ",
  "description": "Mô tả chi tiết về dịch vụ",
  "price": 350000,
  "duration": 60,
  "categoryId": "cat1",
  "suitableForSkinType": "DRY"
}
```

5. Nhấp vào nút "Execute"
6. Kiểm tra kết quả trả về, bạn sẽ nhận được thông tin dịch vụ đã tạo.

## Lưu ý quan trọng

1. **Thời gian hiệu lực token**: Token JWT có thời hạn 24 giờ (86400000 ms). Sau thời gian này, bạn cần đăng nhập lại.
2. **Bảo mật token**: Token JWT chứa thông tin xác thực của bạn. Không chia sẻ token với người khác.
3. **Logout**: Để đăng xuất, bạn có thể nhấp vào nút "Authorize" và sau đó nhấp vào "Logout".
4. **Vấn đề CORS**: Nếu gặp vấn đề CORS khi gọi API từ ứng dụng khác, đảm bảo ứng dụng đã được cấu hình để chấp nhận nguồn gốc của bạn. 