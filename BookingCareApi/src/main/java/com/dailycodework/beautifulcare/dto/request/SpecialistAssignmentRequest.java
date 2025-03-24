package com.dailycodework.beautifulcare.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpecialistAssignmentRequest {

    @NotBlank(message = "Specialist ID is required")
    private String specialistId;

    private String serviceId; // Optional, used only if assigning specialist to a specific service in booking

    private String note;
}