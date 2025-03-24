package com.dailycodework.beautifulcare.service;

import com.dailycodework.beautifulcare.dto.request.SkinTestCreateRequest;
import com.dailycodework.beautifulcare.dto.request.SkinTestResultRequest;
import com.dailycodework.beautifulcare.dto.response.ServiceRecommendationResponse;
import com.dailycodework.beautifulcare.dto.response.SkinTestResponse;
import com.dailycodework.beautifulcare.dto.response.SkinTestResultResponse;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service interface for managing skin test operations
 */
public interface SkinTestService {

    /**
     * Create a new skin test
     * 
     * @param request Skin test creation request
     * @return SkinTestResponse with skin test details
     */
    SkinTestResponse createSkinTest(SkinTestCreateRequest request);

    /**
     * Get all skin tests with optional active status filter
     * 
     * @param active Optional active status filter
     * @return List of skin test responses
     */
    List<SkinTestResponse> getAllSkinTests(Boolean active);

    /**
     * Get skin test by ID
     * 
     * @param id Skin test ID
     * @return SkinTestResponse with skin test details
     */
    SkinTestResponse getSkinTestById(String id);

    /**
     * Get skin tests by user ID
     * 
     * @param userId User ID
     * @return List of skin test responses
     */
    List<SkinTestResponse> getSkinTestsByUserId(String userId);

    /**
     * Get latest skin test by user ID
     * 
     * @param userId User ID
     * @return SkinTestResponse with skin test details
     */
    SkinTestResponse getLatestSkinTestByUserId(String userId);

    /**
     * Get skin tests by user ID and date range
     * 
     * @param userId    User ID
     * @param startDate Start date
     * @param endDate   End date
     * @return List of skin test responses
     */
    List<SkinTestResponse> getSkinTestsByUserIdAndDateRange(String userId, LocalDateTime startDate,
            LocalDateTime endDate);

    /**
     * Update skin test
     * 
     * @param id      Skin test ID
     * @param request Update request
     * @return Updated skin test response
     */
    SkinTestResponse updateSkinTest(String id, SkinTestCreateRequest request);

    /**
     * Delete skin test
     * 
     * @param id Skin test ID
     */
    void deleteSkinTest(String id);

    /**
     * Save skin test result
     * 
     * @param request Skin test result request
     * @return SkinTestResultResponse with result details
     */
    SkinTestResultResponse saveSkinTestResult(SkinTestResultRequest request);

    /**
     * Get skin test result by ID
     * 
     * @param id Result ID
     * @return SkinTestResultResponse with result details
     */
    SkinTestResultResponse getSkinTestResultById(String id);

    /**
     * Get service recommendations based on skin test result
     * 
     * @param resultId Skin test result ID
     * @return List of service recommendation responses
     */
    List<ServiceRecommendationResponse> getServiceRecommendations(String resultId);

    /**
     * Get all skin test results for a customer
     * 
     * @param customerId Customer ID
     * @return List of skin test result responses
     */
    List<SkinTestResultResponse> getCustomerSkinTestResults(String customerId);
}