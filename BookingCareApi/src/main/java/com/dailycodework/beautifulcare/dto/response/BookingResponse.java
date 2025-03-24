package com.dailycodework.beautifulcare.dto.response;

import com.dailycodework.beautifulcare.entity.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private String id;
    private String customerId;
    private String customerName;
    private CustomerResponse customer;
    private LocalDateTime bookingTime;
    private String note;
    private BookingStatus status;
    private List<BookingDetailResponse> details;
    private PaymentResponse payment;
    private List<TreatmentResponse> treatments;
    private LocalDateTime checkinTime;
    private LocalDateTime checkoutTime;
    private LocalDateTime createdAt;
    private double totalPrice;
}