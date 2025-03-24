package com.dailycodework.beautifulcare.controller;

import com.dailycodework.beautifulcare.dto.request.PaymentCreateRequest;
import com.dailycodework.beautifulcare.dto.request.PaymentUpdateRequest;
import com.dailycodework.beautifulcare.dto.response.ApiResponse;
import com.dailycodework.beautifulcare.dto.response.PaymentMethodResponse;
import com.dailycodework.beautifulcare.dto.response.PaymentResponse;
import com.dailycodework.beautifulcare.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for managing payment-related operations.
 * Provides APIs to create, retrieve, update, and process payments.
 */
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {
    private final PaymentService paymentService;

    /**
     * Create a new payment
     * 
     * @param request Payment creation request data
     * @return PaymentResponse with created payment details
     */
    @PostMapping
    public ResponseEntity<ApiResponse<PaymentResponse>> createPayment(
            @Valid @RequestBody PaymentCreateRequest request) {
        log.info("REST request to create a new payment");
        PaymentResponse payment = paymentService.createPayment(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Payment created successfully", payment));
    }

    /**
     * Get all payments with optional filtering
     * 
     * @param bookingId Optional booking ID filter
     * @return List of payment responses
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getAllPayments(
            @RequestParam(required = false) String bookingId) {
        log.info("REST request to get all payments with bookingId: {}", bookingId);
        List<PaymentResponse> payments = paymentService.getAllPayments(bookingId);
        return ResponseEntity.ok(ApiResponse.success("Payments retrieved successfully", payments));
    }

    /**
     * Get payment by ID
     * 
     * @param id Payment ID
     * @return Payment details
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentById(@PathVariable String id) {
        log.info("REST request to get payment by id: {}", id);
        PaymentResponse payment = paymentService.getPaymentById(id);
        return ResponseEntity.ok(ApiResponse.success("Payment retrieved successfully", payment));
    }

    /**
     * Update a payment
     * 
     * @param id      Payment ID
     * @param request Update data
     * @return Updated payment details
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentResponse>> updatePayment(
            @PathVariable String id, @Valid @RequestBody PaymentUpdateRequest request) {
        log.info("REST request to update payment with id: {}", id);
        PaymentResponse updatedPayment = paymentService.updatePayment(id, request);
        return ResponseEntity.ok(ApiResponse.success("Payment updated successfully", updatedPayment));
    }

    /**
     * Process a payment
     * 
     * @param id Payment ID
     * @return Processed payment details
     */
    @PostMapping("/{id}/process")
    public ResponseEntity<ApiResponse<PaymentResponse>> processPayment(@PathVariable String id) {
        log.info("REST request to process payment with id: {}", id);
        PaymentResponse processedPayment = paymentService.processPayment(id);
        return ResponseEntity.ok(ApiResponse.success("Payment processed successfully", processedPayment));
    }

    /**
     * Get available payment methods
     * 
     * @return List of payment methods
     */
    @GetMapping("/methods")
    public ResponseEntity<ApiResponse<List<PaymentMethodResponse>>> getPaymentMethods() {
        log.info("REST request to get payment methods");
        List<PaymentMethodResponse> paymentMethods = paymentService.getPaymentMethods();
        return ResponseEntity.ok(ApiResponse.success("Payment methods retrieved successfully", paymentMethods));
    }
}