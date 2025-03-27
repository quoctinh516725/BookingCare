package com.dailycodework.beautifulcare.dto.response;

import com.dailycodework.beautifulcare.entity.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private UUID id;
    private UUID customerId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private BookingStatus status;
    private String statusDescription;
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String formattedDateTime;
    private String notes;
    private BigDecimal totalPrice;
    private Set<ServiceDetail> services;
    private boolean canCancel;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ServiceDetail {
        private UUID id;
        private String name;
        private String description;
        private BigDecimal price;
        private Integer duration;
        private String image;
    }
}