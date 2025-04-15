package com.dailycodework.beautifulcare.dto.response;

import com.dailycodework.beautifulcare.entity.PaymentStatus;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PaymentResponse {
    private UUID id;
    private String paymentCode;
    private UUID bookingId;
    private BookingResponse bookingDetails;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private UUID staffId;
    private String staffName;
    private BigDecimal amount;
    private PaymentStatus status;
    private String statusDescription;
    private String paymentMethod;
    private String transactionId;
    private String qrData;
    private UUID processedById;
    private String processedByName;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime paidAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime refundedAt;
} 