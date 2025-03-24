package com.dailycodework.beautifulcare.dto.request;

import jakarta.validation.constraints.NotBlank;
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
public class SkinTestCreateRequest {

    @NotBlank(message = "User ID is required")
    private String userId;

    @NotBlank(message = "Skin type is required")
    private String skinType;

    @NotBlank(message = "Skin condition is required")
    private String skinCondition;

    private List<String> allergies;

    private List<String> medications;

    private String notes;

    @NotNull(message = "Test date is required")
    private LocalDateTime testDate;
}