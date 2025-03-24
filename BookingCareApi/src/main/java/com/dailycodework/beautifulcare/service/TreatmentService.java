package com.dailycodework.beautifulcare.service;

import com.dailycodework.beautifulcare.dto.request.TreatmentCreateRequest;
import com.dailycodework.beautifulcare.dto.request.TreatmentResultRequest;
import com.dailycodework.beautifulcare.dto.request.TreatmentUpdateRequest;
import com.dailycodework.beautifulcare.dto.response.TreatmentResponse;
import com.dailycodework.beautifulcare.dto.response.TreatmentResultResponse;
import com.dailycodework.beautifulcare.entity.enums.TreatmentStatus;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service interface for managing treatments.
 */
public interface TreatmentService {
    /**
     * Create a new treatment
     * 
     * @param request Treatment creation request
     * @return TreatmentResponse with created treatment details
     */
    TreatmentResponse createTreatment(TreatmentCreateRequest request);

    /**
     * Get all treatments with optional filters
     * 
     * @param bookingId    Optional booking ID filter
     * @param specialistId Optional specialist ID filter
     * @return List of treatment responses
     */
    List<TreatmentResponse> getAllTreatments(String bookingId, String specialistId);

    /**
     * Get treatment by ID
     * 
     * @param id Treatment ID
     * @return Treatment details
     */
    TreatmentResponse getTreatmentById(String id);

    /**
     * Update a treatment
     * 
     * @param id      Treatment ID
     * @param request Update data
     * @return Updated treatment details
     */
    TreatmentResponse updateTreatment(String id, TreatmentUpdateRequest request);

    /**
     * Start a treatment
     * 
     * @param id Treatment ID
     * @return Updated treatment details
     */
    TreatmentResponse startTreatment(String id);

    /**
     * Complete a treatment
     * 
     * @param id Treatment ID
     * @return Updated treatment details
     */
    TreatmentResponse completeTreatment(String id);

    /**
     * Add a treatment result
     * 
     * @param id      Treatment ID
     * @param request Treatment result data
     * @return Treatment result details
     */
    TreatmentResultResponse addTreatmentResult(String id, TreatmentResultRequest request);

    /**
     * Get treatment result by treatment ID
     * 
     * @param id Treatment ID
     * @return Treatment result details
     */
    TreatmentResultResponse getTreatmentResult(String id);

    List<TreatmentResponse> getTreatmentsByBookingId(String bookingId);

    List<TreatmentResponse> getTreatmentsBySpecialistId(String specialistId);

    List<TreatmentResponse> getTreatmentsByStatus(TreatmentStatus status);

    List<TreatmentResponse> getTreatmentsByDateRange(LocalDateTime startTime, LocalDateTime endTime);

    List<TreatmentResponse> getTreatmentsBySpecialistIdAndDateRange(String specialistId, LocalDateTime startTime,
            LocalDateTime endTime);

    TreatmentResponse getLatestTreatmentByBookingId(String bookingId);

    TreatmentResponse cancelTreatment(String id);

    void deleteTreatment(String id);
}