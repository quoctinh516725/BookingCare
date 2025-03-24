package com.dailycodework.beautifulcare.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkinTestOptionRequest {

    @NotBlank(message = "Option text is required")
    private String optionText;

    @Min(value = 0, message = "Points must be a positive number")
    private int points;

    private String skinTypeIndicator;
}