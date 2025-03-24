package com.dailycodework.beautifulcare.dto.request;

import com.dailycodework.beautifulcare.entity.enums.TreatmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for updating an existing treatment.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TreatmentUpdateRequest {

    private String specialistId;
    private String note;
    private TreatmentStatus status;
    private List<String> serviceIds;
}