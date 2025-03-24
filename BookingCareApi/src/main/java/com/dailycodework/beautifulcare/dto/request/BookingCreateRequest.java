package com.dailycodework.beautifulcare.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
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
public class BookingCreateRequest {

    @NotBlank(message = "Customer ID is required")
    private String customerId;

    @NotNull(message = "Booking time is required")
    @Future(message = "Booking time must be in the future")
    private LocalDateTime bookingTime;

    private String note;

    @NotEmpty(message = "At least one service ID is required")
    private List<String> serviceIds;
}