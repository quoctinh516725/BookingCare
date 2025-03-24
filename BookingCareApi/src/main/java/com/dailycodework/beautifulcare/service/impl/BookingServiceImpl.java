package com.dailycodework.beautifulcare.service.impl;

import com.dailycodework.beautifulcare.dto.request.BookingCreateRequest;
import com.dailycodework.beautifulcare.dto.request.BookingUpdateRequest;
import com.dailycodework.beautifulcare.dto.request.SpecialistAssignmentRequest;
import com.dailycodework.beautifulcare.dto.response.BookingResponse;
import com.dailycodework.beautifulcare.entity.Booking;
import com.dailycodework.beautifulcare.entity.BookingStatus;
import com.dailycodework.beautifulcare.entity.Customer;
import com.dailycodework.beautifulcare.entity.Specialist;
import com.dailycodework.beautifulcare.exception.AppException;
import com.dailycodework.beautifulcare.exception.ErrorCode;
import com.dailycodework.beautifulcare.repository.BookingRepository;
import com.dailycodework.beautifulcare.repository.CustomerRepository;
import com.dailycodework.beautifulcare.repository.ServiceRepository;
import com.dailycodework.beautifulcare.repository.SpecialistRepository;
import com.dailycodework.beautifulcare.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {
    private final BookingRepository bookingRepository;
    private final CustomerRepository customerRepository;
    private final ServiceRepository serviceRepository;
    private final SpecialistRepository specialistRepository;

    @Override
    public BookingResponse createBooking(BookingCreateRequest request) {
        // Find customer
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Create new booking
        Booking booking = new Booking();
        booking.setCustomer(customer);
        booking.setBookingTime(request.getBookingTime());
        booking.setNote(request.getNote());
        booking.setStatus(BookingStatus.PENDING);
        booking.setCreatedAt(LocalDateTime.now());

        // Save booking
        Booking savedBooking = bookingRepository.save(booking);

        // Convert to response
        return mapToBookingResponse(savedBooking);
    }

    @Override
    public List<BookingResponse> getAllBookings(BookingStatus status) {
        List<Booking> bookings;

        if (status != null) {
            bookings = bookingRepository.findByStatus(status);
        } else {
            bookings = bookingRepository.findAll();
        }

        return bookings.stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());
    }

    @Override
    public BookingResponse getBookingById(String id) {
        Booking booking = findBookingById(id);
        return mapToBookingResponse(booking);
    }

    @Override
    public BookingResponse updateBooking(String id, BookingUpdateRequest request) {
        Booking booking = findBookingById(id);

        // Update information
        if (request.getBookingTime() != null) {
            booking.setBookingTime(request.getBookingTime());
        }

        if (request.getNote() != null) {
            booking.setNote(request.getNote());
        }

        if (request.getStatus() != null) {
            booking.setStatus(request.getStatus());
        }

        Booking updatedBooking = bookingRepository.save(booking);
        return mapToBookingResponse(updatedBooking);
    }

    @Override
    public void cancelBooking(String id) {
        Booking booking = findBookingById(id);

        // Check if booking can be cancelled
        if (booking.getStatus() == BookingStatus.COMPLETED ||
                booking.getStatus() == BookingStatus.IN_PROGRESS) {
            throw new AppException(ErrorCode.BOOKING_CANNOT_BE_CANCELLED);
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }

    @Override
    public BookingResponse updateBookingStatus(String id, BookingStatus status) {
        Booking booking = findBookingById(id);
        booking.setStatus(status);
        Booking updatedBooking = bookingRepository.save(booking);
        return mapToBookingResponse(updatedBooking);
    }

    @Override
    public BookingResponse checkinCustomer(String id) {
        Booking booking = findBookingById(id);

        // Check booking status
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new AppException(ErrorCode.BOOKING_INVALID_STATUS);
        }

        booking.setStatus(BookingStatus.CHECKED_IN);
        booking.setCheckinTime(LocalDateTime.now());

        Booking updatedBooking = bookingRepository.save(booking);
        return mapToBookingResponse(updatedBooking);
    }

    @Override
    public BookingResponse assignSpecialist(String id, SpecialistAssignmentRequest request) {
        Booking booking = findBookingById(id);

        // Find specialist
        Specialist specialist = specialistRepository.findById(request.getSpecialistId())
                .orElseThrow(() -> new AppException(ErrorCode.SPECIALIST_NOT_FOUND));

        // TODO: Implement specialist assignment logic in booking detail

        return mapToBookingResponse(booking);
    }

    @Override
    public BookingResponse checkoutCustomer(String id) {
        Booking booking = findBookingById(id);

        // Check booking status
        if (booking.getStatus() != BookingStatus.IN_PROGRESS) {
            throw new AppException(ErrorCode.BOOKING_INVALID_STATUS);
        }

        booking.setStatus(BookingStatus.COMPLETED);
        booking.setCheckoutTime(LocalDateTime.now());

        Booking updatedBooking = bookingRepository.save(booking);
        return mapToBookingResponse(updatedBooking);
    }

    // Helper methods
    private Booking findBookingById(String id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND));
    }

    private BookingResponse mapToBookingResponse(Booking booking) {
        // Map Booking object to BookingResponse
        return BookingResponse.builder()
                .id(booking.getId())
                .customerId(booking.getCustomer().getId())
                .customerName(booking.getCustomer().getFirstName() + " " + booking.getCustomer().getLastName())
                .bookingTime(booking.getBookingTime())
                .status(booking.getStatus())
                .note(booking.getNote())
                .checkinTime(booking.getCheckinTime())
                .checkoutTime(booking.getCheckoutTime())
                .createdAt(booking.getCreatedAt())
                // TODO: Map other fields when needed
                .build();
    }
}