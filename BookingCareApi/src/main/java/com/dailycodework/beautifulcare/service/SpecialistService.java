package com.dailycodework.beautifulcare.service;

import com.dailycodework.beautifulcare.dto.request.SpecialistCreateRequest;
import com.dailycodework.beautifulcare.dto.request.SpecialistUpdateRequest;
import com.dailycodework.beautifulcare.dto.response.ServiceResponse;
import com.dailycodework.beautifulcare.dto.response.SpecialistDetailResponse;
import com.dailycodework.beautifulcare.dto.response.SpecialistResponse;
import com.dailycodework.beautifulcare.dto.response.WorkScheduleResponse;

import java.util.List;

public interface SpecialistService {
    /**
     * Create a new specialist
     */
    SpecialistResponse createSpecialist(SpecialistCreateRequest request);

    /**
     * Get all specialists with optional active filter
     */
    List<SpecialistResponse> getAllSpecialists(Boolean active);

    /**
     * Get a specialist by ID
     */
    SpecialistDetailResponse getSpecialistById(String id);

    /**
     * Get a specialist by user ID
     */
    SpecialistDetailResponse getSpecialistByUserId(String userId);

    /**
     * Get specialists by specialization
     */
    List<SpecialistResponse> getSpecialistsBySpecialization(String specialization);

    /**
     * Update a specialist
     */
    SpecialistResponse updateSpecialist(String id, SpecialistUpdateRequest request);

    /**
     * Delete a specialist
     */
    void deleteSpecialist(String id);

    /**
     * Check if specialist exists by user ID
     */
    boolean existsByUserId(String userId);

    /**
     * Get specialist schedule
     */
    List<WorkScheduleResponse> getSpecialistSchedule(String id);

    /**
     * Get specialists by service ID
     */
    List<SpecialistResponse> getSpecialistsByService(String serviceId);

    /**
     * Get services offered by a specialist
     */
    List<ServiceResponse> getSpecialistServices(String specialistId);
}