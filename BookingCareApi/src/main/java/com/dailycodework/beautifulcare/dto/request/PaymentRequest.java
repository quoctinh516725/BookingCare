package com.dailycodework.beautifulcare.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PaymentRequest {
    @NotNull(message = "ID đặt lịch không được để trống")
    private UUID bookingId;
    
    // Tùy chọn - chỉ cần thiết nếu thanh toán được xử lý bởi người dùng khác (admin/nhân viên)
    private UUID processedById;
    
    @NotBlank(message = "Phương thức thanh toán không được để trống")
    private String paymentMethod;
    
    // Tùy chọn - chỉ sử dụng khi xác nhận thanh toán
    private String transactionId;
    
    // Tùy chọn - nếu muốn điều chỉnh số tiền thanh toán khác với tổng giá đặt lịch
    private BigDecimal amount;
} 