package com.dailycodework.beautifulcare.controller;

import com.dailycodework.beautifulcare.dto.request.TreatmentCreateRequest;
import com.dailycodework.beautifulcare.dto.request.TreatmentResultRequest;
import com.dailycodework.beautifulcare.dto.request.TreatmentUpdateRequest;
import com.dailycodework.beautifulcare.dto.response.ApiResponse;
import com.dailycodework.beautifulcare.dto.response.TreatmentResponse;
import com.dailycodework.beautifulcare.dto.response.TreatmentResultResponse;
import com.dailycodework.beautifulcare.service.TreatmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for managing treatment-related operations.
 * Provides APIs to create, retrieve, update and manage treatments and their
 * results.
 */
@RestController
@RequestMapping("/api/v1/treatments")
@RequiredArgsConstructor
@Slf4j
public class TreatmentController {
    private final TreatmentService treatmentService;

    /**
     * Create a new treatment
     * 
     * @param request Treatment creation request data
     * @return TreatmentResponse with created treatment details
     */
    @PostMapping
    public ResponseEntity<ApiResponse<TreatmentResponse>> createTreatment(
            @Valid @RequestBody TreatmentCreateRequest request) {
        log.info("REST request to create a new treatment");
        TreatmentResponse treatment = treatmentService.createTreatment(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Treatment created successfully", treatment));
    }

    /**
     * Get all treatments with optional booking ID filter
     * 
     * @param bookingId    Optional booking ID filter
     * @param specialistId Optional specialist ID filter
     * @return List of treatment responses
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<TreatmentResponse>>> getAllTreatments(
            @RequestParam(required = false) String bookingId,
            @RequestParam(required = false) String specialistId) {
        log.info("REST request to get all treatments with bookingId: {} and specialistId: {}", bookingId, specialistId);
        List<TreatmentResponse> treatments = treatmentService.getAllTreatments(bookingId, specialistId);
        return ResponseEntity.ok(ApiResponse.success("Treatments retrieved successfully", treatments));
    }

    /**
     * Get treatment by ID
     * 
     * @param id Treatment ID
     * @return Treatment details
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TreatmentResponse>> getTreatmentById(@PathVariable String id) {
        log.info("REST request to get treatment by id: {}", id);
        TreatmentResponse treatment = treatmentService.getTreatmentById(id);
        return ResponseEntity.ok(ApiResponse.success("Treatment retrieved successfully", treatment));
    }

    /**
     * Update a treatment
     * 
     * @param id      Treatment ID
     * @param request Update data
     * @return Updated treatment details
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TreatmentResponse>> updateTreatment(
            @PathVariable String id, @Valid @RequestBody TreatmentUpdateRequest request) {
        log.info("REST request to update treatment with id: {}", id);
        TreatmentResponse updatedTreatment = treatmentService.updateTreatment(id, request);
        return ResponseEntity.ok(ApiResponse.success("Treatment updated successfully", updatedTreatment));
    }

    /**
     * Start a treatment
     * 
     * @param id Treatment ID
     * @return Updated treatment details
     */
    @PutMapping("/{id}/start")
    public ResponseEntity<ApiResponse<TreatmentResponse>> startTreatment(@PathVariable String id) {
        log.info("REST request to start treatment with id: {}", id);
        TreatmentResponse updatedTreatment = treatmentService.startTreatment(id);
        return ResponseEntity.ok(ApiResponse.success("Treatment started successfully", updatedTreatment));
    }

    /**
     * Complete a treatment
     * 
     * @param id Treatment ID
     * @return Updated treatment details
     */
    @PutMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<TreatmentResponse>> completeTreatment(@PathVariable String id) {
        log.info("REST request to complete treatment with id: {}", id);
        TreatmentResponse updatedTreatment = treatmentService.completeTreatment(id);
        return ResponseEntity.ok(ApiResponse.success("Treatment completed successfully", updatedTreatment));
    }

    /**
     * Add a treatment result
     * 
     * @param id      Treatment ID
     * @param request Treatment result data
     * @return Treatment result details
     */
    @PostMapping("/{id}/results")
    public ResponseEntity<ApiResponse<TreatmentResultResponse>> addTreatmentResult(
            @PathVariable String id, @Valid @RequestBody TreatmentResultRequest request) {
        log.info("REST request to add treatment result for treatment with id: {}", id);
        TreatmentResultResponse result = treatmentService.addTreatmentResult(id, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Treatment result added successfully", result));
    }

    /**
     * Get treatment results by treatment ID
     * 
     * @param id Treatment ID
     * @return Treatment result details
     */
    @GetMapping("/{id}/results")
    public ResponseEntity<ApiResponse<TreatmentResultResponse>> getTreatmentResult(@PathVariable String id) {
        log.info("REST request to get treatment result for treatment with id: {}", id);
        TreatmentResultResponse result = treatmentService.getTreatmentResult(id);
        return ResponseEntity.ok(ApiResponse.success("Treatment result retrieved successfully", result));
    }
}