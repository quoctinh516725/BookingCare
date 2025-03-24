package com.dailycodework.beautifulcare.dto.response;

import com.dailycodework.beautifulcare.entity.enums.TreatmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for returning treatment information.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TreatmentResponse {

    private String id;
    private String bookingId;
    private String customerId;
    private String customerName;
    private String specialistId;
    private String specialistName;
    private LocalDateTime createdAt;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    private TreatmentStatus status;
    private String note;
    private List<ServiceResponse> services;
    private boolean hasResults;
}