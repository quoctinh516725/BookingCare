package com.dailycodework.beautifulcare.service;

import com.dailycodework.beautifulcare.dto.request.BookingCreateRequest;
import com.dailycodework.beautifulcare.dto.request.BookingUpdateRequest;
import com.dailycodework.beautifulcare.dto.request.SpecialistAssignmentRequest;
import com.dailycodework.beautifulcare.dto.response.BookingResponse;
import com.dailycodework.beautifulcare.entity.BookingStatus;

import java.util.List;

/**
 * Service interface for managing booking operations
 */
public interface BookingService {

    /**
     * Create a new booking
     * 
     * @param request Booking creation request
     * @return BookingResponse with booking details
     */
    BookingResponse createBooking(BookingCreateRequest request);

    /**
     * Get all bookings with optional status filter
     * 
     * @param status Optional status filter
     * @return List of booking responses
     */
    List<BookingResponse> getAllBookings(BookingStatus status);

    /**
     * Get booking by ID
     * 
     * @param id Booking ID
     * @return BookingResponse with booking details
     */
    BookingResponse getBookingById(String id);

    /**
     * Update a booking
     * 
     * @param id      Booking ID
     * @param request Booking update request
     * @return Updated booking response
     */
    BookingResponse updateBooking(String id, BookingUpdateRequest request);

    /**
     * Cancel a booking
     * 
     * @param id Booking ID
     */
    void cancelBooking(String id);

    /**
     * Update booking status
     * 
     * @param id     Booking ID
     * @param status New status
     * @return Updated booking response
     */
    BookingResponse updateBookingStatus(String id, BookingStatus status);

    /**
     * Check-in a customer for their booking
     * 
     * @param id Booking ID
     * @return Updated booking response
     */
    BookingResponse checkinCustomer(String id);

    /**
     * Assign a specialist to a booking
     * 
     * @param id      Booking ID
     * @param request Specialist assignment request
     * @return Updated booking response
     */
    BookingResponse assignSpecialist(String id, SpecialistAssignmentRequest request);

    /**
     * Check-out a customer after their booking is complete
     * 
     * @param id Booking ID
     * @return Updated booking response
     */
    BookingResponse checkoutCustomer(String id);
}