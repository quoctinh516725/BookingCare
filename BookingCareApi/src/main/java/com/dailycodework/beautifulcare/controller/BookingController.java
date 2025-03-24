package com.dailycodework.beautifulcare.controller;

import com.dailycodework.beautifulcare.dto.request.BookingCreateRequest;
import com.dailycodework.beautifulcare.dto.request.BookingUpdateRequest;
import com.dailycodework.beautifulcare.dto.request.SpecialistAssignmentRequest;
import com.dailycodework.beautifulcare.dto.response.ApiResponse;
import com.dailycodework.beautifulcare.dto.response.BookingResponse;
import com.dailycodework.beautifulcare.entity.BookingStatus;
import com.dailycodework.beautifulcare.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for managing booking-related operations.
 * Provides APIs to create, retrieve, update and delete bookings,
 * as well as specialized operations like check-in, check-out, and specialist
 * assignment.
 */
@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
@Slf4j
public class BookingController {
    private final BookingService bookingService;

    /**
     * Create a new booking
     * 
     * @param request Booking creation request data
     * @return BookingResponse with created booking details
     */
    @PreAuthorize("isAuthenticated()")
    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @Valid @RequestBody BookingCreateRequest request) {
        log.info("REST request to create a new booking");
        BookingResponse booking = bookingService.createBooking(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Booking created successfully", booking));
    }

    /**
     * Get all bookings with optional filtering
     * 
     * @param status Optional status filter
     * @return List of booking responses
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getAllBookings(
            @RequestParam(required = false) BookingStatus status) {
        log.info("REST request to get all bookings with status: {}", status);
        List<BookingResponse> bookings = bookingService.getAllBookings(status);
        return ResponseEntity.ok(ApiResponse.success("Bookings retrieved successfully", bookings));
    }

    /**
     * Get booking by ID
     * 
     * @param id Booking ID
     * @return Booking details
     */
    @PreAuthorize("hasRole('ADMIN') or @bookingSecurityService.isOwnerOrAssignedSpecialist(#id)")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingById(@PathVariable String id) {
        log.info("REST request to get booking by id: {}", id);
        BookingResponse booking = bookingService.getBookingById(id);
        return ResponseEntity.ok(ApiResponse.success("Booking retrieved successfully", booking));
    }

    /**
     * Update a booking
     * 
     * @param id      Booking ID
     * @param request Update data
     * @return Updated booking details
     */
    @PreAuthorize("hasRole('ADMIN') or @bookingSecurityService.isOwnerOrAssignedSpecialist(#id)")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> updateBooking(
            @PathVariable String id, @Valid @RequestBody BookingUpdateRequest request) {
        log.info("REST request to update booking with id: {}", id);
        BookingResponse updatedBooking = bookingService.updateBooking(id, request);
        return ResponseEntity.ok(ApiResponse.success("Booking updated successfully", updatedBooking));
    }

    /**
     * Delete/cancel a booking
     * 
     * @param id Booking ID
     * @return Success message
     */
    @PreAuthorize("hasRole('ADMIN') or @bookingSecurityService.isOwnerOrAssignedSpecialist(#id)")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBooking(@PathVariable String id) {
        log.info("REST request to delete booking with id: {}", id);
        bookingService.cancelBooking(id);
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled successfully", null));
    }

    /**
     * Update booking status
     * 
     * @param id     Booking ID
     * @param status New status
     * @return Updated booking details
     */
    @PreAuthorize("hasRole('ADMIN') or hasRole('SPECIALIST') and @bookingSecurityService.isAssignedSpecialist(#id)")
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<BookingResponse>> updateBookingStatus(
            @PathVariable String id, @RequestParam BookingStatus status) {
        log.info("REST request to update booking status with id: {} to status: {}", id, status);
        BookingResponse updatedBooking = bookingService.updateBookingStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Booking status updated successfully", updatedBooking));
    }

    /**
     * Check-in a customer for their booking
     * 
     * @param id Booking ID
     * @return Updated booking details
     */
    @PreAuthorize("hasRole('ADMIN') or hasRole('SPECIALIST') and @bookingSecurityService.isAssignedSpecialist(#id)")
    @PutMapping("/{id}/checkin")
    public ResponseEntity<ApiResponse<BookingResponse>> checkinCustomer(@PathVariable String id) {
        log.info("REST request to check in customer for booking with id: {}", id);
        BookingResponse updatedBooking = bookingService.checkinCustomer(id);
        return ResponseEntity.ok(ApiResponse.success("Customer checked in successfully", updatedBooking));
    }

    /**
     * Assign a specialist to a booking
     * 
     * @param id      Booking ID
     * @param request Specialist assignment details
     * @return Updated booking details
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/assign")
    public ResponseEntity<ApiResponse<BookingResponse>> assignSpecialist(
            @PathVariable String id, @Valid @RequestBody SpecialistAssignmentRequest request) {
        log.info("REST request to assign specialist to booking with id: {}", id);
        BookingResponse updatedBooking = bookingService.assignSpecialist(id, request);
        return ResponseEntity.ok(ApiResponse.success("Specialist assigned successfully", updatedBooking));
    }

    /**
     * Check-out a customer after their booking is complete
     * 
     * @param id Booking ID
     * @return Updated booking details
     */
    @PreAuthorize("hasRole('ADMIN') or hasRole('SPECIALIST') and @bookingSecurityService.isAssignedSpecialist(#id)")
    @PutMapping("/{id}/checkout")
    public ResponseEntity<ApiResponse<BookingResponse>> checkoutCustomer(@PathVariable String id) {
        log.info("REST request to check out customer for booking with id: {}", id);
        BookingResponse updatedBooking = bookingService.checkoutCustomer(id);
        return ResponseEntity.ok(ApiResponse.success("Customer checked out successfully", updatedBooking));
    }
}