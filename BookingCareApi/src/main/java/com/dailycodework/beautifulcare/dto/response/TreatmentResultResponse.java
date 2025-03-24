package com.dailycodework.beautifulcare.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for returning treatment result information.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TreatmentResultResponse {

    private String id;
    private String treatmentId;
    private String specialistId;
    private String specialistName;
    private LocalDateTime createdAt;
    private String description;
    private String recommendations;
    private List<String> imageUrls;
    private List<String> productRecommendations;
}