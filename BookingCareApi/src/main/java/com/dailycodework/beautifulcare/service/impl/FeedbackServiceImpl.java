package com.dailycodework.beautifulcare.service.impl;

import com.dailycodework.beautifulcare.dto.request.FeedbackRequest;
import com.dailycodework.beautifulcare.dto.response.FeedbackResponse;
import com.dailycodework.beautifulcare.entity.Booking;
import com.dailycodework.beautifulcare.entity.BookingStatus;
import com.dailycodework.beautifulcare.entity.Feedback;
import com.dailycodework.beautifulcare.entity.User;
import com.dailycodework.beautifulcare.exception.AccessDeniedException;
import com.dailycodework.beautifulcare.exception.DuplicateResourceException;
import com.dailycodework.beautifulcare.exception.InvalidOperationException;
import com.dailycodework.beautifulcare.exception.ResourceNotFoundException;
import com.dailycodework.beautifulcare.mapper.FeedbackMapper;
import com.dailycodework.beautifulcare.repository.BookingRepository;
import com.dailycodework.beautifulcare.repository.FeedbackRepository;
import com.dailycodework.beautifulcare.repository.UserRepository;
import com.dailycodework.beautifulcare.security.SecurityUtils;
import com.dailycodework.beautifulcare.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FeedbackServiceImpl implements FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final FeedbackMapper feedbackMapper;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final SecurityUtils securityUtils;

    @Override
    public List<FeedbackResponse> getAllFeedbacks() {
        log.info("Retrieving all feedbacks");
        // Admin access is checked at controller level with @PreAuthorize
        return feedbackRepository.findAll().stream()
                .map(feedbackMapper::toFeedbackResponse)
                .collect(Collectors.toList());
    }

    @Override
    public FeedbackResponse getFeedbackById(UUID id) {
        log.info("Retrieving feedback with ID: {}", id);
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found with id: " + id));

        // Check if user has permission to access this feedback
        if (!securityUtils.hasFeedbackAccess(feedback)) {
            throw new AccessDeniedException("You don't have permission to access this feedback");
        }

        return feedbackMapper.toFeedbackResponse(feedback);
    }

    @Override
    @Transactional
    public FeedbackResponse createFeedback(FeedbackRequest request) {
        log.info("Creating new feedback for booking: {}", request.getBookingId());

        // Validate booking exists
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Booking not found with id: " + request.getBookingId()));

        // Validate customer exists
        User customer = userRepository.findById(request.getCustomerId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Customer not found with id: " + request.getCustomerId()));

        // Make sure the current user is the customer (or admin)
        User currentUser = securityUtils.getOrCreateUser();
        if (!securityUtils.isAdmin() && !currentUser.getId().equals(request.getCustomerId())) {
            throw new AccessDeniedException("You can only create feedback for your own bookings");
        }

        // Check if the customer is the one who made the booking
        if (!booking.getCustomer().getId().equals(request.getCustomerId())) {
            throw new AccessDeniedException("You can only provide feedback for bookings you have made");
        }

        // Check if the booking is completed
        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new InvalidOperationException("You can only provide feedback for completed bookings");
        }

        // Check if feedback already exists for this booking
        if (feedbackRepository.existsByBookingId(request.getBookingId())) {
            throw new DuplicateResourceException("Feedback already exists for this booking");
        }

        Feedback feedback = feedbackMapper.toFeedback(request);
        feedback.setBooking(booking);
        feedback.setCustomer(customer);

        return feedbackMapper.toFeedbackResponse(feedbackRepository.save(feedback));
    }

    @Override
    @Transactional
    public FeedbackResponse updateFeedback(UUID id, FeedbackRequest request) {
        log.info("Updating feedback with ID: {}", id);

        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found with id: " + id));

        // Check if user has permission to update this feedback
        User currentUser = securityUtils.getOrCreateUser();
        if (!securityUtils.isAdmin() && !feedback.getCustomer().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You can only update your own feedback");
        }

        // If customer ID is provided, make sure it's the same as the original
        if (request.getCustomerId() != null && !request.getCustomerId().equals(feedback.getCustomer().getId())) {
            throw new InvalidOperationException("Cannot change the customer for existing feedback");
        }

        // If booking ID is provided, make sure it's the same as the original
        if (request.getBookingId() != null && !request.getBookingId().equals(feedback.getBooking().getId())) {
            throw new InvalidOperationException("Cannot change the booking for existing feedback");
        }

        // Update feedback attributes
        feedbackMapper.updateFeedback(feedback, request);

        return feedbackMapper.toFeedbackResponse(feedbackRepository.save(feedback));
    }

    @Override
    @Transactional
    public void deleteFeedback(UUID id) {
        log.info("Deleting feedback with ID: {}", id);

        // Admin access is checked at controller level with @PreAuthorize
        if (!feedbackRepository.existsById(id)) {
            throw new ResourceNotFoundException("Feedback not found with id: " + id);
        }

        feedbackRepository.deleteById(id);
    }

    @Override
    public List<FeedbackResponse> getFeedbacksByBooking(UUID bookingId) {
        log.info("Retrieving feedbacks for booking: {}", bookingId);

        // Check if the booking exists
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        // Check if user has permission to access this booking's feedback
        if (!securityUtils.hasBookingAccess(booking)) {
            throw new AccessDeniedException("You don't have permission to access feedbacks for this booking");
        }

        return feedbackRepository.findByBookingId(bookingId).stream()
                .map(feedbackMapper::toFeedbackResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<FeedbackResponse> getFeedbacksByCustomer(UUID customerId) {
        log.info("Retrieving feedbacks for customer: {}", customerId);

        // Check if user has permission to access this customer's feedback
        // Permission check is done at controller level

        return feedbackRepository.findByCustomerId(customerId).stream()
                .map(feedbackMapper::toFeedbackResponse)
                .collect(Collectors.toList());
    }
}