package com.dailycodework.beautifulcare.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkinTestResultRequest {

    @NotBlank(message = "Skin test ID is required")
    private String skinTestId;

    @NotBlank(message = "Customer ID is required")
    private String customerId;

    @NotEmpty(message = "At least one answer is required")
    private Map<String, String> answers; // Map of questionId to optionId
}