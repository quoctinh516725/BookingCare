package com.dailycodework.beautifulcare.repository;

import com.dailycodework.beautifulcare.entity.Booking;
import com.dailycodework.beautifulcare.entity.BookingStatus;
import com.dailycodework.beautifulcare.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, String> {
    List<Booking> findByStatus(BookingStatus status);

    List<Booking> findByCustomer(Customer customer);

    List<Booking> findByCustomerId(String customerId);

    List<Booking> findByBookingTimeBetween(LocalDateTime startDateTime, LocalDateTime endDateTime);

    List<Booking> findByCustomerIdAndStatus(String customerId, BookingStatus status);

    List<Booking> findByTreatmentsSpecialistId(String specialistId);

    long countByStatus(BookingStatus status);

    long countByBookingTimeBetween(LocalDateTime start, LocalDateTime end);
}