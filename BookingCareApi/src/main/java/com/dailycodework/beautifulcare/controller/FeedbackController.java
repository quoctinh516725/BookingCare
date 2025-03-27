package com.dailycodework.beautifulcare.controller;

import com.dailycodework.beautifulcare.dto.request.FeedbackRequest;
import com.dailycodework.beautifulcare.dto.response.FeedbackResponse;
import com.dailycodework.beautifulcare.security.SecurityUtils;
import com.dailycodework.beautifulcare.service.FeedbackService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/feedbacks")
@RequiredArgsConstructor
@Tag(name = "Feedback", description = "Feedback management APIs")
public class FeedbackController {

    private final FeedbackService feedbackService;
    private final SecurityUtils securityUtils;

    @GetMapping
    @Operation(summary = "Get all feedbacks", description = "Retrieve a list of all feedback (Admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FeedbackResponse>> getAllFeedbacks() {
        return ResponseEntity.ok(feedbackService.getAllFeedbacks());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get feedback by ID", description = "Retrieve feedback by its unique identifier")
    public ResponseEntity<FeedbackResponse> getFeedbackById(@PathVariable UUID id) {
        // SecurityUtils will check access in service layer
        return ResponseEntity.ok(feedbackService.getFeedbackById(id));
    }

    @PostMapping
    @Operation(summary = "Create feedback", description = "Submit new feedback for a completed booking")
    public ResponseEntity<FeedbackResponse> createFeedback(@Valid @RequestBody FeedbackRequest request) {
        // SecurityUtils will check if user has permission to create feedback for this
        // booking
        return new ResponseEntity<>(feedbackService.createFeedback(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update feedback", description = "Update existing feedback by ID")
    public ResponseEntity<FeedbackResponse> updateFeedback(
            @PathVariable UUID id,
            @Valid @RequestBody FeedbackRequest request) {
        // SecurityUtils will check if user has permission to update this feedback
        return ResponseEntity.ok(feedbackService.updateFeedback(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete feedback", description = "Delete feedback by ID (Admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteFeedback(@PathVariable UUID id) {
        feedbackService.deleteFeedback(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/booking/{bookingId}")
    @Operation(summary = "Get feedbacks by booking", description = "Retrieve all feedback for a specific booking")
    public ResponseEntity<List<FeedbackResponse>> getFeedbacksByBooking(@PathVariable UUID bookingId) {
        // SecurityUtils will check if user has permission to view feedback for this
        // booking
        return ResponseEntity.ok(feedbackService.getFeedbacksByBooking(bookingId));
    }

    @GetMapping("/my-feedbacks")
    @Operation(summary = "Get current user's feedbacks", description = "Retrieve all feedback submitted by the current user")
    public ResponseEntity<List<FeedbackResponse>> getMyFeedbacks() {
        UUID currentUserId = securityUtils.getCurrentUser().getId();
        return ResponseEntity.ok(feedbackService.getFeedbacksByCustomer(currentUserId));
    }

    @GetMapping("/customer/{customerId}")
    @Operation(summary = "Get feedbacks by customer", description = "Retrieve all feedback from a specific customer (Admin or owner only)")
    public ResponseEntity<List<FeedbackResponse>> getFeedbacksByCustomer(@PathVariable UUID customerId) {
        // Check if current user is admin or the customer themself
        if (!securityUtils.isOwnerOrAdmin(customerId)) {
            throw new com.dailycodework.beautifulcare.exception.AccessDeniedException(
                    "You are not authorized to view these feedbacks");
        }
        return ResponseEntity.ok(feedbackService.getFeedbacksByCustomer(customerId));
    }
}