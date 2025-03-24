package com.dailycodework.beautifulcare.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private String id;
    private String bookingId;
    private Double amount;
    private String paymentMethod;
    private String transactionId;
    private boolean paid;
    private LocalDateTime paymentDate;
    private LocalDateTime createdAt;
    private BookingResponse booking;
}