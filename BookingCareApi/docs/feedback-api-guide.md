# Feedback API Guide

## Tổng quan

API Feedback cho phép khách hàng gửi đánh giá về trải nghiệm dịch vụ sau khi hoàn thành một lịch hẹn. Hệ thống đảm bảo chỉ khách hàng đã sử dụng dịch vụ mới có thể đánh giá, và mỗi booking chỉ được đánh giá một lần.

## Endpoint APIs

### 1. Lấy tất cả feedback (Admin only)

```
GET /api/v1/feedbacks
```

**Quyền truy cập**: Chỉ ADMIN

**Response**:

```json
[
  {
    "id": "uuid",
    "rating": 5,
    "comment": "Dịch vụ rất tốt!",
    "bookingId": "uuid",
    "customerId": "uuid",
    "customerName": "Nguyễn Văn A",
    "createdAt": "2023-07-15T10:30:00",
    "updatedAt": "2023-07-15T10:30:00"
  }
  // ...
]
```

### 2. Lấy feedback theo ID

```
GET /api/v1/feedbacks/{id}
```

**Quyền truy cập**:

- ADMIN: tất cả feedbacks
- CUSTOMER: chỉ feedback của mình

**Response**:

```json
{
  "id": "uuid",
  "rating": 5,
  "comment": "Dịch vụ rất tốt!",
  "bookingId": "uuid",
  "customerId": "uuid",
  "customerName": "Nguyễn Văn A",
  "createdAt": "2023-07-15T10:30:00",
  "updatedAt": "2023-07-15T10:30:00"
}
```

### 3. Tạo feedback mới

```
POST /api/v1/feedbacks
```

**Quyền truy cập**: User đã đăng nhập (chỉ cho booking của chính mình đã hoàn thành)

**Request Body**:

```json
{
  "bookingId": "uuid",
  "customerId": "uuid",
  "rating": 5,
  "comment": "Dịch vụ rất tốt!"
}
```

**Điều kiện**:

- Booking phải ở trạng thái COMPLETED
- Chưa có feedback nào cho booking này
- Người tạo feedback phải là người đã đặt lịch

**Response**: 201 Created với nội dung tương tự như GET feedback

### 4. Cập nhật feedback

```
PUT /api/v1/feedbacks/{id}
```

**Quyền truy cập**:

- ADMIN: tất cả feedbacks
- CUSTOMER: chỉ feedback của mình

**Request Body**:

```json
{
  "rating": 4,
  "comment": "Dịch vụ khá tốt, nhưng có thể cải thiện thêm"
}
```

**Lưu ý**: Không thể thay đổi bookingId hoặc customerId

**Response**: 200 OK với nội dung đã cập nhật

### 5. Xóa feedback

```
DELETE /api/v1/feedbacks/{id}
```

**Quyền truy cập**: Chỉ ADMIN

**Response**: 204 No Content

### 6. Lấy feedbacks theo booking

```
GET /api/v1/feedbacks/booking/{bookingId}
```

**Quyền truy cập**:

- ADMIN/STAFF: tất cả bookings
- CUSTOMER: chỉ booking của mình

**Response**: Danh sách feedbacks (thường chỉ có 1)

### 7. Lấy feedbacks của người dùng hiện tại

```
GET /api/v1/feedbacks/my-feedbacks
```

**Quyền truy cập**: User đã đăng nhập

**Response**: Danh sách feedbacks của người dùng hiện tại

### 8. Lấy feedbacks theo customer

```
GET /api/v1/feedbacks/customer/{customerId}
```

**Quyền truy cập**:

- ADMIN: tất cả customers
- CUSTOMER: chỉ feedback của mình (customerId phải trùng với ID người dùng hiện tại)

**Response**: Danh sách feedbacks của customer

## Luồng tạo feedback

1. Khách hàng hoàn thành lịch hẹn (booking chuyển sang trạng thái COMPLETED)
2. Frontend kiểm tra trạng thái booking và hiển thị form feedback nếu chưa có feedback
3. Gửi request POST với bookingId, customerId và nội dung đánh giá
4. Backend kiểm tra các điều kiện: trạng thái booking, quyền sở hữu, có feedback trước đó chưa
5. Nếu hợp lệ, lưu feedback và trả về thông tin đánh giá đã tạo

## Xử lý lỗi

### Lỗi phổ biến

1. **403 Forbidden**: Không đủ quyền truy cập

   ```json
   {
     "statusCode": 403,
     "message": "You don't have permission to access this feedback",
     "timestamp": "2023-07-15T10:30:00"
   }
   ```

2. **400 Bad Request**: Booking chưa hoàn thành

   ```json
   {
     "statusCode": 400,
     "message": "You can only provide feedback for completed bookings",
     "timestamp": "2023-07-15T10:30:00"
   }
   ```

3. **409 Conflict**: Đã có feedback cho booking
   ```json
   {
     "statusCode": 409,
     "message": "Feedback already exists for this booking",
     "timestamp": "2023-07-15T10:30:00"
   }
   ```

## Hiển thị UI cho Feedback

### Khi nào hiển thị nút "Đánh giá"?

Frontend nên kiểm tra các điều kiện sau để quyết định hiển thị nút "Đánh giá":

1. Booking phải ở trạng thái COMPLETED
2. Chưa có feedback nào cho booking này
3. Người dùng hiện tại phải là người đã đặt lịch

### Ví dụ về kiểm tra trong code React:

```jsx
function BookingDetails({ booking }) {
  const [hasFeedback, setHasFeedback] = useState(false);
  const currentUser = useAuth();

  useEffect(() => {
    // Kiểm tra đã có feedback chưa
    async function checkFeedback() {
      try {
        const response = await api.get(
          `/api/v1/feedbacks/booking/${booking.id}`
        );
        setHasFeedback(response.data.length > 0);
      } catch (error) {
        console.error("Error checking feedback:", error);
      }
    }

    if (booking.status === "COMPLETED") {
      checkFeedback();
    }
  }, [booking.id, booking.status]);

  const canLeaveFeedback =
    booking.status === "COMPLETED" &&
    !hasFeedback &&
    booking.customer.id === currentUser.id;

  return (
    <div>
      {/* Chi tiết booking */}

      {canLeaveFeedback && (
        <button onClick={() => navigate(`/feedback/create/${booking.id}`)}>
          Đánh giá dịch vụ
        </button>
      )}

      {hasFeedback && <div className="feedback-badge">Đã đánh giá</div>}
    </div>
  );
}
```

## Kiểm thử và sử dụng

Để kiểm thử API, bạn có thể sử dụng Swagger UI hoặc Postman với các endpoint được liệt kê ở trên. Đảm bảo thêm header Authorization với JWT token hợp lệ cho các yêu cầu yêu cầu xác thực.

## Liên hệ

Nếu bạn có câu hỏi hoặc gặp vấn đề với Feedback API, vui lòng liên hệ đội backend tại: backend@beautifulcare.com
