# Booking API Guide

## Tổng quan

API Booking cho phép khách hàng đặt lịch hẹn cho các dịch vụ làm đẹp, quản lý lịch trình và thay đổi trạng thái đặt lịch. Hệ thống bao gồm các biện pháp kiểm tra để đảm bảo không có xung đột lịch hẹn và chỉ những người dùng có quyền mới có thể thao tác với booking.

## Trạng thái booking

Booking trong hệ thống có thể có một trong các trạng thái sau:

1. **PENDING**: Trạng thái ban đầu khi khách hàng mới đặt lịch
2. **CONFIRMED**: Đã được nhân viên xác nhận
3. **COMPLETED**: Dịch vụ đã được thực hiện xong
4. **CANCELLED**: Đã bị hủy (có thể do khách hàng hoặc nhân viên)
5. **NO_SHOW**: Khách hàng không đến theo lịch hẹn

## Endpoint APIs

### 1. Lấy tất cả bookings (Admin/Staff only)

```
GET /api/v1/bookings
```

**Quyền truy cập**: ADMIN, STAFF

**Response**:

```json
[
  {
    "id": "uuid",
    "bookingDate": "2023-07-20",
    "startTime": "10:00:00",
    "endTime": "11:30:00",
    "status": "CONFIRMED",
    "totalPrice": 500000,
    "customerName": "Nguyễn Văn A",
    "customerEmail": "nguyenvana@example.com",
    "customerPhone": "0987654321",
    "services": [
      {
        "id": "uuid",
        "name": "Cắt tóc",
        "price": 200000,
        "duration": 45
      },
      {
        "id": "uuid",
        "name": "Gội đầu",
        "price": 300000,
        "duration": 30
      }
    ],
    "formattedDateTime": "20/07/2023 10:00 - 11:30",
    "statusDescription": "Đã xác nhận",
    "canCancel": true,
    "createdAt": "2023-07-15T10:30:00",
    "updatedAt": "2023-07-15T10:30:00"
  }
  // ...
]
```

### 2. Lấy bookings của người dùng hiện tại

```
GET /api/v1/bookings/my-bookings
```

**Quyền truy cập**: User đã đăng nhập

**Response**: Tương tự như endpoint trên, nhưng chỉ trả về booking của người dùng hiện tại

### 3. Lấy bookings theo trạng thái (Admin/Staff only)

```
GET /api/v1/bookings/status?status=CONFIRMED&page=0&size=10
```

**Quyền truy cập**: ADMIN, STAFF

**Tham số query**:

- `status`: Trạng thái booking (tùy chọn)
- `page`: Số trang (mặc định là 0)
- `size`: Số lượng kết quả mỗi trang (mặc định là 10)

**Response**:

```json
{
  "content": [
    // các booking như trên
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 10,
    "sort": {
      /* thông tin sắp xếp */
    }
  },
  "totalElements": 23,
  "totalPages": 3,
  "last": false,
  "first": true
}
```

### 4. Lấy booking theo ID

```
GET /api/v1/bookings/{id}
```

**Quyền truy cập**:

- ADMIN/STAFF: Tất cả bookings
- CUSTOMER: Chỉ booking của mình

**Response**: Chi tiết booking như mẫu trên

### 5. Tạo booking mới

```
POST /api/v1/bookings
```

**Quyền truy cập**: User đã đăng nhập

**Request Body**:

```json
{
  "customerId": "uuid",
  "bookingDate": "2023-07-20",
  "startTime": "10:00",
  "endTime": "11:30",
  "serviceIds": ["uuid1", "uuid2"]
}
```

**Điều kiện**:

- Ngày đặt lịch không được trong quá khứ
- Thời gian không được trùng với booking khác
- CustomerId phải trùng với ID người dùng hiện tại (trừ khi là admin/staff)

**Response**: 201 Created với chi tiết booking đã tạo

### 6. Cập nhật booking

```
PUT /api/v1/bookings/{id}
```

**Quyền truy cập**:

- ADMIN/STAFF: Tất cả bookings
- CUSTOMER: Chỉ booking của mình và chưa COMPLETED/CANCELLED/NO_SHOW

**Request Body**: Tương tự như khi tạo booking

**Response**: 200 OK với thông tin booking đã cập nhật

### 7. Cập nhật trạng thái booking (Admin/Staff only)

```
PUT /api/v1/bookings/{id}/status?status=CONFIRMED
```

**Quyền truy cập**: ADMIN, STAFF

**Tham số query**:

- `status`: Trạng thái mới của booking

**Điều kiện**: Chỉ cho phép các chuyển đổi trạng thái hợp lệ:

- PENDING -> CONFIRMED, CANCELLED
- CONFIRMED -> COMPLETED, CANCELLED, NO_SHOW
- COMPLETED, CANCELLED, NO_SHOW: Không thể chuyển đổi (trạng thái cuối)

**Response**: 200 OK với thông tin booking đã cập nhật

### 8. Xóa booking

```
DELETE /api/v1/bookings/{id}
```

**Quyền truy cập**:

- ADMIN: Tất cả bookings
- CUSTOMER: Chỉ booking của mình và đang ở trạng thái PENDING hoặc CONFIRMED

**Response**: 204 No Content

## Ràng buộc quan trọng

### 1. Kiểm tra xung đột thời gian

Hệ thống kiểm tra xung đột thời gian để đảm bảo không có hai booking trùng thời gian, bao gồm:

- Kiểm tra thời gian bắt đầu và kết thúc không trùng với booking hiện có
- Chỉ xem xét các booking ở trạng thái PENDING và CONFIRMED khi kiểm tra xung đột

### 2. Tính toán tự động

Hệ thống tự động tính toán:

- Thời gian kết thúc (nếu không cung cấp) dựa trên thời gian bắt đầu và tổng thời gian của các dịch vụ
- Tổng giá tiền dựa trên các dịch vụ được chọn

### 3. Kiểm tra quyền truy cập

- Khách hàng chỉ có thể xem, sửa, và xóa booking của chính mình
- Admin và Staff có quyền truy cập tất cả bookings
- Khách hàng không thể cập nhật/xóa booking đã COMPLETED, CANCELLED, hoặc NO_SHOW

## Mã lỗi

### 1. Lỗi về xác thực

- **403 Forbidden**: Không có quyền truy cập
  ```json
  {
    "statusCode": 403,
    "message": "You don't have permission to access this booking",
    "timestamp": "2023-07-15T10:30:00"
  }
  ```

### 2. Lỗi về thời gian đặt lịch

- **400 Bad Request**: Đặt lịch trong quá khứ
  ```json
  {
    "statusCode": 400,
    "message": "Cannot create booking for past dates",
    "timestamp": "2023-07-15T10:30:00"
  }
  ```

### 3. Lỗi xung đột

- **409 Conflict**: Thời gian đặt lịch bị trùng
  ```json
  {
    "statusCode": 409,
    "message": "The requested time slot is not available",
    "timestamp": "2023-07-15T10:30:00"
  }
  ```

### 4. Lỗi về trạng thái

- **400 Bad Request**: Thao tác không hợp lệ với trạng thái hiện tại
  ```json
  {
    "statusCode": 400,
    "message": "Cannot update booking with status: COMPLETED",
    "timestamp": "2023-07-15T10:30:00"
  }
  ```

## Hiển thị UI cho Booking

### Hiển thị trạng thái booking

Đây là cách hiển thị màu sắc và văn bản cho các trạng thái:

```jsx
function getStatusColor(status) {
  switch (status) {
    case "PENDING":
      return "#FFD700"; // Vàng
    case "CONFIRMED":
      return "#4169E1"; // Xanh dương
    case "COMPLETED":
      return "#32CD32"; // Xanh lá
    case "CANCELLED":
      return "#DC143C"; // Đỏ
    case "NO_SHOW":
      return "#808080"; // Xám
    default:
      return "#000000";
  }
}

function getStatusText(status) {
  switch (status) {
    case "PENDING":
      return "Chờ xác nhận";
    case "CONFIRMED":
      return "Đã xác nhận";
    case "COMPLETED":
      return "Hoàn thành";
    case "CANCELLED":
      return "Đã hủy";
    case "NO_SHOW":
      return "Không đến";
    default:
      return status;
  }
}
```

### Kiểm tra người dùng có thể hủy booking không

```jsx
function canUserCancelBooking(booking, currentUser) {
  // Admin có thể hủy mọi booking PENDING hoặc CONFIRMED
  if (currentUser.role === "ADMIN") {
    return booking.status === "PENDING" || booking.status === "CONFIRMED";
  }

  // Staff có thể hủy mọi booking PENDING hoặc CONFIRMED
  if (currentUser.role === "STAFF") {
    return booking.status === "PENDING" || booking.status === "CONFIRMED";
  }

  // Customer chỉ có thể hủy booking của mình và ở trạng thái PENDING hoặc CONFIRMED
  return (
    booking.customerId === currentUser.id &&
    (booking.status === "PENDING" || booking.status === "CONFIRMED")
  );
}
```

## Kiểm thử và sử dụng

Để kiểm thử API, bạn có thể sử dụng Swagger UI hoặc Postman với các endpoint được liệt kê ở trên. Đảm bảo thêm header Authorization với JWT token hợp lệ cho các yêu cầu yêu cầu xác thực.

## Liên hệ

Nếu bạn có câu hỏi hoặc gặp vấn đề với Booking API, vui lòng liên hệ đội backend tại: backend@beautifulcare.com
