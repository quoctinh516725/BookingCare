package com.dailycodework.beautifulcare.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for recording treatment results.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TreatmentResultRequest {

    @NotBlank(message = "Description is required")
    private String description;

    private String recommendations;

    private List<String> imageUrls;

    private List<String> productRecommendations;
}