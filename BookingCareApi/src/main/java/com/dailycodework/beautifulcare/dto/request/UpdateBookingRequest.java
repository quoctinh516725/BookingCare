package com.dailycodework.beautifulcare.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
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
@EqualsAndHashCode(callSuper = true)
public class UpdateBookingRequest extends BookingRequest {
    @NotNull(message = "Booking ID is required")
    private UUID bookingId;

    private String notes;
} 