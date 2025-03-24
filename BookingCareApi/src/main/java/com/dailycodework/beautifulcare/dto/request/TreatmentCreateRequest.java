package com.dailycodework.beautifulcare.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for creating a new treatment.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TreatmentCreateRequest {

    @NotBlank(message = "Booking ID is required")
    private String bookingId;

    @NotBlank(message = "Specialist ID is required")
    private String specialistId;

    private String note;

    @NotEmpty(message = "At least one service ID is required")
    private List<String> serviceIds;
}