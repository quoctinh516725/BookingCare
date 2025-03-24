package com.dailycodework.beautifulcare.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class SkinTestResponse {
    private String id;
    private String userId;
    private String skinType;
    private String skinCondition;
    private List<String> allergies;
    private List<String> medications;
    private String notes;
    private LocalDateTime testDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}