package com.dailycodework.beautifulcare.controller;

import com.dailycodework.beautifulcare.dto.request.PaymentRequest;
import com.dailycodework.beautifulcare.dto.response.PaymentResponse;
import com.dailycodework.beautifulcare.entity.PaymentStatus;
import com.dailycodework.beautifulcare.exception.InvalidOperationException;
import com.dailycodework.beautifulcare.exception.ResourceNotFoundException;
import com.dailycodework.beautifulcare.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Tag(name = "Payment", description = "Payment management APIs")
public class PaymentController {
    
    private final PaymentService paymentService;
    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);
    
    @GetMapping
    @Operation(summary = "Get all payments (Admin/Staff only)")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<PaymentResponse>> getAllPayments() {
        log.info("GET /api/v1/payments: Fetching all payments");
        return ResponseEntity.ok(paymentService.getAllPayments());
    }
    
    @GetMapping("/status/{status}")
    @Operation(summary = "Get payments by status (Admin/Staff only)")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByStatus(@PathVariable PaymentStatus status) {
        log.info("GET /api/v1/payments/status/{}: Fetching payments with status", status);
        return ResponseEntity.ok(paymentService.getPaymentsByStatus(status));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get payment by ID")
    public ResponseEntity<PaymentResponse> getPaymentById(@PathVariable UUID id) {
        log.info("GET /api/v1/payments/{}: Fetching payment details", id);
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }
    
    @GetMapping("/code/{paymentCode}")
    @Operation(summary = "Get payment by code")
    public ResponseEntity<PaymentResponse> getPaymentByCode(@PathVariable String paymentCode) {
        log.info("GET /api/v1/payments/code/{}: Fetching payment by code", paymentCode);
        return ResponseEntity.ok(paymentService.getPaymentByCode(paymentCode));
    }
    
    @GetMapping("/booking/{bookingId}")
    @Operation(summary = "Get payment by booking ID")
    public ResponseEntity<PaymentResponse> getPaymentByBookingId(@PathVariable UUID bookingId) {
        log.info("GET /api/v1/payments/booking/{}: Fetching payment for booking", bookingId);
        return ResponseEntity.ok(paymentService.getPaymentByBookingId(bookingId));
    }
    
    @PostMapping("/create/{bookingId}")
    @Operation(summary = "Create payment for booking")
    public ResponseEntity<?> createPaymentForBooking(@PathVariable UUID bookingId) {
        log.info("POST /api/v1/payments/create/{}: Creating payment for booking", bookingId);
        
        try {
            PaymentResponse response = paymentService.createPaymentForBooking(bookingId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Tạo thanh toán thành công",
                "data", response
            ));
        } catch (ResourceNotFoundException e) {
            log.error("Booking not found: {}", e.getMessage());
            return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of(
                    "success", false,
                    "message", e.getMessage()
                ));
        } catch (AccessDeniedException e) {
            log.error("Access denied: {}", e.getMessage());
            return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(Map.of(
                    "success", false,
                    "message", "Bạn không có quyền tạo thanh toán cho lịch đặt này"
                ));
        } catch (Exception e) {
            log.error("Error creating payment", e);
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "success", false,
                    "message", "Đã xảy ra lỗi khi tạo thanh toán: " + e.getMessage()
                ));
        }
    }
    
    @PutMapping("/confirm")
    @Operation(summary = "Confirm payment")
    public ResponseEntity<?> confirmPayment(@Valid @RequestBody PaymentRequest request) {
        log.info("PUT /api/v1/payments/confirm: Confirming payment for booking ID {}", request.getBookingId());
        
        try {
            PaymentResponse response = paymentService.confirmPayment(request);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Xác nhận thanh toán thành công",
                "data", response
            ));
        } catch (ResourceNotFoundException e) {
            log.error("Resource not found: {}", e.getMessage());
            return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of(
                    "success", false,
                    "message", e.getMessage()
                ));
        } catch (InvalidOperationException e) {
            log.error("Invalid operation: {}", e.getMessage());
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                    "success", false,
                    "message", e.getMessage()
                ));
        } catch (Exception e) {
            log.error("Error confirming payment", e);
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "success", false,
                    "message", "Đã xảy ra lỗi khi xác nhận thanh toán: " + e.getMessage()
                ));
        }
    }
    
    @PutMapping("/{id}/status/{status}")
    @Operation(summary = "Update payment status (Admin/Staff only)")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<?> updatePaymentStatus(
            @PathVariable UUID id,
            @PathVariable PaymentStatus status) {
        log.info("PUT /api/v1/payments/{}/status/{}: Updating payment status", id, status);
        
        try {
            PaymentResponse response = paymentService.updatePaymentStatus(id, status);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Cập nhật trạng thái thanh toán thành công",
                "data", response
            ));
        } catch (ResourceNotFoundException e) {
            log.error("Payment not found: {}", e.getMessage());
            return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of(
                    "success", false,
                    "message", e.getMessage()
                ));
        } catch (InvalidOperationException e) {
            log.error("Invalid status transition: {}", e.getMessage());
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                    "success", false,
                    "message", e.getMessage()
                ));
        } catch (Exception e) {
            log.error("Error updating payment status", e);
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "success", false,
                    "message", "Đã xảy ra lỗi khi cập nhật trạng thái thanh toán: " + e.getMessage()
                ));
        }
    }
    
    @PutMapping("/{id}/refund")
    @Operation(summary = "Refund payment (Admin only)")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> refundPayment(@PathVariable UUID id) {
        log.info("PUT /api/v1/payments/{}/refund: Refunding payment", id);
        
        try {
            PaymentResponse response = paymentService.refundPayment(id);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Hoàn tiền thành công",
                "data", response
            ));
        } catch (ResourceNotFoundException e) {
            log.error("Payment not found: {}", e.getMessage());
            return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(Map.of(
                    "success", false,
                    "message", e.getMessage()
                ));
        } catch (InvalidOperationException e) {
            log.error("Invalid operation: {}", e.getMessage());
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                    "success", false,
                    "message", e.getMessage()
                ));
        } catch (Exception e) {
            log.error("Error refunding payment", e);
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "success", false,
                    "message", "Đã xảy ra lỗi khi hoàn tiền: " + e.getMessage()
                ));
        }
    }
} 