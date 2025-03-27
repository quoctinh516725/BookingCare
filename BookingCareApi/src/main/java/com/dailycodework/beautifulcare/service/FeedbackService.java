package com.dailycodework.beautifulcare.service;

import com.dailycodework.beautifulcare.dto.request.FeedbackRequest;
import com.dailycodework.beautifulcare.dto.response.FeedbackResponse;

import java.util.List;
import java.util.UUID;

public interface FeedbackService {
    /**
     * Get all feedback entries
     * 
     * @return List of all feedback responses
     */
    List<FeedbackResponse> getAllFeedbacks();

    /**
     * Get feedback by ID
     * 
     * @param id The feedback ID to find
     * @return Feedback response if found
     */
    FeedbackResponse getFeedbackById(UUID id);

    /**
     * Create new feedback
     * 
     * @param request The feedback request data
     * @return Created feedback response
     */
    FeedbackResponse createFeedback(FeedbackRequest request);

    /**
     * Update existing feedback
     * 
     * @param id      The feedback ID to update
     * @param request The updated feedback data
     * @return Updated feedback response
     */
    FeedbackResponse updateFeedback(UUID id, FeedbackRequest request);

    /**
     * Delete feedback by ID
     * 
     * @param id The feedback ID to delete
     */
    void deleteFeedback(UUID id);

    /**
     * Get all feedback for a specific booking
     * 
     * @param bookingId The booking ID to find feedback for
     * @return List of matching feedback
     */
    List<FeedbackResponse> getFeedbacksByBooking(UUID bookingId);

    /**
     * Get all feedback from a specific customer
     * 
     * @param customerId The customer ID to find feedback for
     * @return List of matching feedback
     */
    List<FeedbackResponse> getFeedbacksByCustomer(UUID customerId);
}