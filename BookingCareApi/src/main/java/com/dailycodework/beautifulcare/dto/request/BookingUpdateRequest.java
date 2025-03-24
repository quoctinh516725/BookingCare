package com.dailycodework.beautifulcare.dto.request;

import com.dailycodework.beautifulcare.entity.BookingStatus;
import jakarta.validation.constraints.Future;
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
public class BookingUpdateRequest {

    @Future(message = "Booking time must be in the future")
    private LocalDateTime bookingTime;

    private String note;

    private BookingStatus status;

    private List<String> serviceIds;
}