package com.dailycodework.beautifulcare.repository;

import com.dailycodework.beautifulcare.entity.Booking;
import com.dailycodework.beautifulcare.entity.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {
    List<Booking> findByCustomerId(UUID customerId);

    List<Booking> findByAppointmentTimeBetween(LocalDateTime startDateTime, LocalDateTime endDateTime);

    Page<Booking> findByStatus(BookingStatus status, Pageable pageable);

    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByAppointmentTimeBetweenAndStatusIn(
            LocalDateTime startDateTime,
            LocalDateTime endDateTime,
            List<BookingStatus> statuses);

    List<Booking> findByAppointmentTimeBetweenAndStatusInAndIdNot(
            LocalDateTime startDateTime,
            LocalDateTime endDateTime,
            List<BookingStatus> statuses,
            UUID bookingId);

    List<Booking> findByAppointmentTimeBetweenAndStaffIdAndStatusIn(
            LocalDateTime startDateTime,
            LocalDateTime endDateTime,
            UUID staffId,
            List<BookingStatus> statuses);

    List<Booking> findByAppointmentTimeBetweenAndStaffIdAndStatusInAndIdNot(
            LocalDateTime startDateTime,
            LocalDateTime endDateTime,
            UUID staffId,
            List<BookingStatus> statuses,
            UUID bookingId);
}