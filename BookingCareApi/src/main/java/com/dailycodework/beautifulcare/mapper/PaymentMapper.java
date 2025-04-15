package com.dailycodework.beautifulcare.mapper;

import com.dailycodework.beautifulcare.dto.response.BookingResponse;
import com.dailycodework.beautifulcare.dto.response.PaymentResponse;
import com.dailycodework.beautifulcare.entity.Booking;
import com.dailycodework.beautifulcare.entity.Payment;
import com.dailycodework.beautifulcare.entity.PaymentStatus;
import com.dailycodework.beautifulcare.entity.User;
import org.json.JSONObject;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Random;

@Mapper(componentModel = "spring", uses = {BookingMapper.class})
public abstract class PaymentMapper {
    
    @Autowired
    private BookingMapper bookingMapper;
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "booking", source = "booking")
    @Mapping(target = "status", constant = "UNPAID")
    @Mapping(target = "amount", source = "booking.totalPrice")
    @Mapping(target = "paymentCode", expression = "java(generatePaymentCode(booking))")
    @Mapping(target = "qrCodeData", expression = "java(generateQRData(booking))")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "paidAt", ignore = true)
    @Mapping(target = "refundedAt", ignore = true)
    @Mapping(target = "processedBy", ignore = true)
    @Mapping(target = "paymentMethod", ignore = true)
    @Mapping(target = "transactionId", ignore = true)
    public abstract Payment toPayment(Booking booking);
    
    @Mapping(target = "bookingId", source = "booking.id")
    @Mapping(target = "customerName", expression = "java(getFullName(payment.getBooking().getCustomer()))")
    @Mapping(target = "customerEmail", source = "booking.customer.email")
    @Mapping(target = "customerPhone", source = "booking.customer.phone")
    @Mapping(target = "staffId", source = "booking.staff.id")
    @Mapping(target = "staffName", expression = "java(getFullName(payment.getBooking().getStaff()))")
    @Mapping(target = "statusDescription", source = "status", qualifiedByName = "getStatusDescription")
    @Mapping(target = "processedById", source = "processedBy.id")
    @Mapping(target = "processedByName", expression = "java(payment.getProcessedBy() != null ? getFullName(payment.getProcessedBy()) : \"Chưa xử lý\")")
    @Mapping(target = "bookingDetails", source = "booking", qualifiedByName = "toBookingResponseOptional")
    @Mapping(target = "qrData", source = "qrCodeData")
    public abstract PaymentResponse toPaymentResponse(Payment payment);
    
    @Named("toBookingResponseOptional")
    protected BookingResponse toBookingResponseOptional(Booking booking) {
        return booking != null ? bookingMapper.toBookingResponse(booking) : null;
    }
    
    @Named("getStatusDescription") 
    protected String getStatusDescription(PaymentStatus status) {
        if (status == null) return "Không xác định";
        switch (status) {
            case UNPAID: return "Chưa thanh toán";
            case COMPLETED: return "Đã thanh toán";
            case REFUNDED: return "Đã hoàn tiền";
            default: return status.toString();
        }
    }
    
    protected String getFullName(User user) {
        if (user == null) return "Không xác định";
        
        String firstName = user.getFirstName() != null ? user.getFirstName() : "";
        String lastName = user.getLastName() != null ? user.getLastName() : "";
        
        String fullName = (firstName + " " + lastName).trim();
        return fullName.isEmpty() ? (user.getUsername() != null ? user.getUsername() : "Không xác định") : fullName;
    }
    
    protected String generatePaymentCode(Booking booking) {
        if (booking == null || booking.getId() == null) {
            throw new IllegalArgumentException("Booking or Booking ID cannot be null");
        }
        
        // Lấy 8 ký tự đầu từ UUID booking và chuyển thành chữ hoa
        String bookingIdStr = booking.getId().toString().replace("-", "").substring(0, 8).toUpperCase();
        // Tạo 4 số ngẫu nhiên
        String randomDigits = String.format("%04d", new Random().nextInt(10000));
        
        // Kết hợp để tạo mã thanh toán
        return "BC-" + bookingIdStr + "-" + randomDigits;
    }
    
    protected String generateQRData(Booking booking) {
        if (booking == null || booking.getId() == null) {
            throw new IllegalArgumentException("Booking or Booking ID cannot be null");
        }
        
        JSONObject qrData = new JSONObject();
        qrData.put("bookingId", booking.getId().toString());
        qrData.put("paymentCode", generatePaymentCode(booking));
        qrData.put("amount", booking.getTotalPrice());
        
        if (booking.getCustomer() != null) {
            qrData.put("customerName", getFullName(booking.getCustomer()));
            qrData.put("customerId", booking.getCustomer().getId().toString());
        }
        
        // Thêm thông tin về dịch vụ đã đặt
        JSONObject servicesInfo = new JSONObject();
        booking.getServices().forEach(service -> {
            servicesInfo.put(service.getId().toString(), service.getName());
        });
        qrData.put("services", servicesInfo);
        
        return qrData.toString();
    }
} 