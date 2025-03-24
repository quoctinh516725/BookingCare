package com.dailycodework.beautifulcare.service;

import com.dailycodework.beautifulcare.dto.request.PaymentCreateRequest;
import com.dailycodework.beautifulcare.dto.request.PaymentUpdateRequest;
import com.dailycodework.beautifulcare.dto.response.PaymentMethodResponse;
import com.dailycodework.beautifulcare.dto.response.PaymentResponse;

import java.util.List;

/**
 * Service interface for managing payment operations
 */
public interface PaymentService {

    /**
     * Create a new payment
     * 
     * @param request Payment creation request
     * @return PaymentResponse with payment details
     */
    PaymentResponse createPayment(PaymentCreateRequest request);

    /**
     * Get all payments with optional booking ID filter
     * 
     * @param bookingId Optional booking ID filter
     * @return List of payment responses
     */
    List<PaymentResponse> getAllPayments(String bookingId);

    /**
     * Get payment by ID
     * 
     * @param id Payment ID
     * @return PaymentResponse with payment details
     */
    PaymentResponse getPaymentById(String id);

    /**
     * Update a payment
     * 
     * @param id      Payment ID
     * @param request Payment update request
     * @return Updated payment response
     */
    PaymentResponse updatePayment(String id, PaymentUpdateRequest request);

    /**
     * Process a payment
     * 
     * @param id Payment ID
     * @return Processed payment response
     */
    PaymentResponse processPayment(String id);

    /**
     * Get available payment methods
     * 
     * @return List of payment method responses
     */
    List<PaymentMethodResponse> getPaymentMethods();
}