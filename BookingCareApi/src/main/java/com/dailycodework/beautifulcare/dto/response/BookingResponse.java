package com.dailycodework.beautifulcare.dto.response;

import com.dailycodework.beautifulcare.entity.BookingStatus;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Set;
import java.util.UUID;

@Data
@SuperBuilder
@NoArgsConstructor
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
    @SuperBuilder
    @NoArgsConstructor
    public static class ServiceDetail {
        private UUID id;
        private String name;
        private String description;
        private BigDecimal price;
        private Integer duration;
        private String image;
    }
}