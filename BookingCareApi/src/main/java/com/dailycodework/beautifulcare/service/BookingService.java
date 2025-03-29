package com.dailycodework.beautifulcare.service;

import com.dailycodework.beautifulcare.dto.request.BookingRequest;
import com.dailycodework.beautifulcare.dto.request.UpdateBookingRequest;
import com.dailycodework.beautifulcare.dto.response.BookingResponse;
import com.dailycodework.beautifulcare.dto.response.UpdateBookingResponse;
import com.dailycodework.beautifulcare.entity.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Service interface for managing booking operations
 */
public interface BookingService {

    /**
     * Gets all bookings.
     *
     * @return a list of bookings
     */
    List<BookingResponse> getAllBookings();

    /**
     * Gets a booking by its ID.
     *
     * @param id the booking ID
     * @return the booking
     */
    BookingResponse getBookingById(UUID id);

    /**
     * Creates a new booking for a customer.
     *
     * @param request the booking data
     * @return the created booking
     */
    BookingResponse createBooking(BookingRequest request);

    /**
     * Updates a booking with new information.
     *
     * @param id      the booking ID
     * @param request the updated booking data
     * @return the updated booking
     */
    BookingResponse updateBooking(UUID id, BookingRequest request);

    /**
     * Updates a booking with new information using UpdateBookingRequest.
     *
     * @param request the update booking request
     * @return the updated booking response
     */
    UpdateBookingResponse updateBookingWithDetails(UpdateBookingRequest request);

    /**
     * Deletes a booking.
     *
     * @param id the booking ID
     */
    void deleteBooking(UUID id);

    /**
     * Updates the status of a booking.
     *
     * @param id     the booking ID
     * @param status the new status
     * @return the updated booking
     */
    BookingResponse updateBookingStatus(UUID id, BookingStatus status);

    /**
     * Gets all bookings for a specific customer.
     *
     * @param customerId the customer ID
     * @return a list of bookings
     */
    List<BookingResponse> getBookingsByCustomer(UUID customerId);

    /**
     * Gets all bookings for a specific date.
     *
     * @param date the date
     * @return a list of bookings
     */
    List<BookingResponse> getBookingsByDate(LocalDate date);

    /**
     * Gets all bookings, optionally filtered by status.
     *
     * @param status   the status to filter by, or null for all bookings
     * @param pageable pagination information
     * @return a page of bookings
     */
    Page<BookingResponse> getAllBookings(BookingStatus status, Pageable pageable);
}