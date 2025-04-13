package com.dailycodework.beautifulcare.controller;

import com.dailycodework.beautifulcare.dto.request.BookingRequest;
import com.dailycodework.beautifulcare.dto.request.TimeSlotCheckRequest;
import com.dailycodework.beautifulcare.dto.request.UpdateBookingRequest;
import com.dailycodework.beautifulcare.dto.response.BookingResponse;
import com.dailycodework.beautifulcare.dto.response.TimeSlotAvailabilityResponse;
import com.dailycodework.beautifulcare.dto.response.UpdateBookingResponse;
import com.dailycodework.beautifulcare.entity.BookingStatus;
import com.dailycodework.beautifulcare.exception.BookingConflictException;
import com.dailycodework.beautifulcare.security.SecurityUtils;
import com.dailycodework.beautifulcare.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST controller for managing bookings
 */
@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
@Tag(name = "Booking", description = "Booking management APIs")
public class BookingController {
    private final BookingService bookingService;
    private final SecurityUtils securityUtils;
    private static final Logger log = LoggerFactory.getLogger(BookingController.class);

    @GetMapping
    @Operation(summary = "Get all bookings (Admin/Staff only)")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<BookingResponse>> getAllBookings() {
        log.info("GET /api/v1/bookings: Fetching all bookings");
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/my-bookings")
    @Operation(summary = "Get current user's bookings")
    public ResponseEntity<List<BookingResponse>> getMyBookings() {
        UUID currentUserId = securityUtils.getOrCreateUser().getId();
        log.info("GET /api/v1/bookings/my-bookings: Fetching bookings for user ID {}", currentUserId);
        return ResponseEntity.ok(bookingService.getBookingsByCustomer(currentUserId));
    }

    @GetMapping("/status")
    @Operation(summary = "Get all bookings by status (Admin/Staff only)")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<Page<BookingResponse>> getBookingsByStatus(
            @RequestParam(required = false) BookingStatus status,
            @PageableDefault(size = 10) Pageable pageable) {
        log.info("GET /api/v1/bookings/status: Fetching bookings with status {}", status);
        return ResponseEntity.ok(bookingService.getAllBookings(status, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get booking by ID")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable UUID id) {
        log.info("GET /api/v1/bookings/{}: Fetching booking detail", id);
        // SecurityUtils will check access in service layer
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @PostMapping
    @Operation(summary = "Create new booking")
    public ResponseEntity<?> createBooking(@Valid @RequestBody BookingRequest request) {
        log.info("POST /api/v1/bookings: Creating new booking for customer {}", request.getCustomerId());
        
        try {
            BookingResponse response = bookingService.createBooking(request);
            // Trả về thông báo thành công cùng với dữ liệu
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Đặt lịch thành công!",
                "data", response
            ));
        } catch (BookingConflictException e) {
            log.warn("Booking conflict detected: {}", e.getMessage());
            // Trả về 409 Conflict với thông báo chi tiết
            return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(Map.of(
                    "success", false,
                    "message", e.getMessage(),
                    "reason", e.getReason() != null ? e.getReason() : "CONFLICT"
                ));
        } catch (Exception e) {
            log.error("Error creating booking", e);
            // Phân tích loại lỗi và trả về thông báo phù hợp
            String errorMessage = "Đã xảy ra lỗi khi tạo lịch hẹn";
            String errorReason = "SERVER_ERROR";
            
            if (e instanceof com.dailycodework.beautifulcare.exception.InvalidBookingException) {
                errorMessage = e.getMessage();
                errorReason = "INVALID_BOOKING";
                return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                        "success", false,
                        "message", errorMessage,
                        "reason", errorReason
                    ));
            } else if (e instanceof com.dailycodework.beautifulcare.exception.ResourceNotFoundException) {
                errorMessage = e.getMessage();
                errorReason = "RESOURCE_NOT_FOUND";
                return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                        "success", false,
                        "message", errorMessage,
                        "reason", errorReason
                    ));
            }
            
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "success", false,
                    "message", errorMessage,
                    "reason", errorReason
                ));
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update booking")
    public ResponseEntity<BookingResponse> updateBooking(
            @PathVariable UUID id,
            @Valid @RequestBody BookingRequest request) {
        log.info("PUT /api/v1/bookings/{}: Updating booking", id);
        // SecurityUtils will check access in service layer
        return ResponseEntity.ok(bookingService.updateBooking(id, request));
    }

    @PutMapping("/update")
    @Operation(summary = "Update booking with details")
    public ResponseEntity<UpdateBookingResponse> updateBookingWithDetails(
            @Valid @RequestBody UpdateBookingRequest request) {
        log.info("PUT /api/v1/bookings/update: Updating booking with details");
        // SecurityUtils will check access in service layer
        return ResponseEntity.ok(bookingService.updateBookingWithDetails(request));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update booking status")
    public ResponseEntity<BookingResponse> updateBookingStatus(
            @PathVariable UUID id,
            @RequestParam BookingStatus status) {
        log.info("PUT /api/v1/bookings/{}/status: Updating booking status to {}", id, status);
        return ResponseEntity.ok(bookingService.updateBookingStatus(id, status));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete booking")
    public ResponseEntity<Void> deleteBooking(@PathVariable UUID id) {
        log.info("DELETE /api/v1/bookings/{}: Deleting booking", id);
        // SecurityUtils will check access in service layer
        bookingService.deleteBooking(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/check-availability")
    @Operation(summary = "Check if a time slot is available")
    public ResponseEntity<?> checkTimeSlotAvailability(@Valid @RequestBody TimeSlotCheckRequest request) {
        log.info("POST /api/v1/bookings/check-availability: Checking availability for time slot: staff={}, date={}, time={}", 
                request.getStaffId(), request.getBookingDate(), request.getStartTime());
        
        try {
            TimeSlotAvailabilityResponse response = bookingService.checkTimeSlotAvailability(request);
            log.info("Time slot availability check result: {}", response);
            return ResponseEntity.ok(response);
        } catch (BookingConflictException e) {
            log.warn("Time slot conflict detected: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("available", false);
            errorResponse.put("reason", e.getReason());
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(errorResponse);
        } catch (Exception e) {
            log.error("Error checking time slot availability", e);
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Error checking time slot availability"));
        }
    }

    @GetMapping("/staff-booked-times")
    @Operation(summary = "Get all booked time slots for a staff member on a specific date")
    public ResponseEntity<List<String>> getBookedTimeSlots(
            @RequestParam UUID staffId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<String> bookedTimeSlots = bookingService.getBookedTimeSlots(staffId, date);
        return ResponseEntity.ok(bookedTimeSlots);
    }
    
    @GetMapping("/all-staff-booked-times")
    @Operation(summary = "Get all booked time slots for all staff members on a specific date")
    public ResponseEntity<Map<UUID, List<String>>> getAllStaffBookedTimeSlots(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        Map<UUID, List<String>> allBookedTimeSlots = bookingService.getAllStaffBookedTimeSlots(date);
        return ResponseEntity.ok(allBookedTimeSlots);
    }
}