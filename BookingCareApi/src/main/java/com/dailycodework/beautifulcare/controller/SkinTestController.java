package com.dailycodework.beautifulcare.controller;

import com.dailycodework.beautifulcare.dto.request.SkinTestCreateRequest;
import com.dailycodework.beautifulcare.dto.request.SkinTestResultRequest;
import com.dailycodework.beautifulcare.dto.response.ApiResponse;
import com.dailycodework.beautifulcare.dto.response.ServiceRecommendationResponse;
import com.dailycodework.beautifulcare.dto.response.SkinTestResponse;
import com.dailycodework.beautifulcare.dto.response.SkinTestResultResponse;
import com.dailycodework.beautifulcare.service.SkinTestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for managing skin test-related operations.
 * Provides APIs to create and manage skin tests, process test results, and get
 * recommendations.
 */
@RestController
@RequestMapping("/api/v1/skin-tests")
@RequiredArgsConstructor
@Slf4j
public class SkinTestController {
    private final SkinTestService skinTestService;

    /**
     * Create a new skin test
     * 
     * @param request Skin test creation request data
     * @return SkinTestResponse with created skin test details
     */
    @PreAuthorize("hasRole('ADMIN') or hasRole('SPECIALIST')")
    @PostMapping
    public ResponseEntity<ApiResponse<SkinTestResponse>> createSkinTest(
            @Valid @RequestBody SkinTestCreateRequest request) {
        log.info("REST request to create a new skin test");
        SkinTestResponse skinTest = skinTestService.createSkinTest(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Skin test created successfully", skinTest));
    }

    /**
     * Get all skin tests
     * 
     * @param active Optional active status filter
     * @return List of skin test responses
     */
    @PreAuthorize("hasRole('ADMIN') or hasRole('SPECIALIST')")
    @GetMapping
    public ResponseEntity<ApiResponse<List<SkinTestResponse>>> getAllSkinTests(
            @RequestParam(required = false) Boolean active) {
        log.info("REST request to get all skin tests with active status: {}", active);
        List<SkinTestResponse> skinTests = skinTestService.getAllSkinTests(active);
        return ResponseEntity.ok(ApiResponse.success("Skin tests retrieved successfully", skinTests));
    }

    /**
     * Get skin test by ID
     * 
     * @param id Skin test ID
     * @return Skin test details
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SkinTestResponse>> getSkinTestById(@PathVariable String id) {
        log.info("REST request to get skin test by id: {}", id);
        SkinTestResponse skinTest = skinTestService.getSkinTestById(id);
        return ResponseEntity.ok(ApiResponse.success("Skin test retrieved successfully", skinTest));
    }

    /**
     * Save skin test result
     * 
     * @param request Skin test result request data
     * @return Skin test result response
     */
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/results")
    public ResponseEntity<ApiResponse<SkinTestResultResponse>> saveSkinTestResult(
            @Valid @RequestBody SkinTestResultRequest request) {
        log.info("REST request to save skin test result");
        SkinTestResultResponse result = skinTestService.saveSkinTestResult(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Skin test result saved successfully", result));
    }

    /**
     * Get skin test result by ID
     * 
     * @param id Skin test result ID
     * @return Skin test result details
     */
    @PreAuthorize("hasRole('ADMIN') or hasRole('SPECIALIST') or @skinTestSecurityService.isTestResultOwner(#id)")
    @GetMapping("/results/{id}")
    public ResponseEntity<ApiResponse<SkinTestResultResponse>> getSkinTestResultById(@PathVariable String id) {
        log.info("REST request to get skin test result by id: {}", id);
        SkinTestResultResponse result = skinTestService.getSkinTestResultById(id);
        return ResponseEntity.ok(ApiResponse.success("Skin test result retrieved successfully", result));
    }

    /**
     * Get service recommendations based on skin test result
     * 
     * @param resultId Skin test result ID
     * @return List of service recommendations
     */
    @PreAuthorize("hasRole('ADMIN') or hasRole('SPECIALIST') or @skinTestSecurityService.isTestResultOwner(#resultId)")
    @GetMapping("/recommendations")
    public ResponseEntity<ApiResponse<List<ServiceRecommendationResponse>>> getRecommendations(
            @RequestParam String resultId) {
        log.info("REST request to get recommendations for skin test result: {}", resultId);
        List<ServiceRecommendationResponse> recommendations = skinTestService.getServiceRecommendations(resultId);
        return ResponseEntity
                .ok(ApiResponse.success("Service recommendations retrieved successfully", recommendations));
    }

    /**
     * Get all skin test results for a customer
     * 
     * @param customerId Customer ID
     * @return List of skin test result responses
     */
    @PreAuthorize("hasRole('ADMIN') or hasRole('SPECIALIST') or @securityService.isCurrentUser(authentication, #customerId)")
    @GetMapping("/results/customer/{customerId}")
    public ResponseEntity<ApiResponse<List<SkinTestResultResponse>>> getCustomerSkinTestResults(
            @PathVariable String customerId) {
        log.info("REST request to get skin test results for customer: {}", customerId);
        List<SkinTestResultResponse> results = skinTestService.getCustomerSkinTestResults(customerId);
        return ResponseEntity.ok(ApiResponse.success("Customer skin test results retrieved successfully", results));
    }
}