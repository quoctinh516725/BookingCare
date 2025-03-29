package com.dailycodework.beautifulcare.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;
import java.util.UUID;

@Data
@SuperBuilder
@NoArgsConstructor
public class BookingRequest {
    @NotNull(message = "Customer ID is required")
    private UUID customerId;

    @NotNull(message = "Service IDs are required")
    private Set<UUID> serviceIds;

    @NotNull(message = "Booking date is required")
    private LocalDate bookingDate;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    private LocalTime endTime;

    private BigDecimal totalPrice;

    private String notes;
}

@Data
@SuperBuilder
@NoArgsConstructor
class BookingDetailRequest {
    private UUID serviceId;
    private Double price;
    private Integer quantity;
    private String note;
}