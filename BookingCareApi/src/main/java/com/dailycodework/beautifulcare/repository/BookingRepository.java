package com.dailycodework.beautifulcare.repository;

import com.dailycodework.beautifulcare.entity.Booking;
import com.dailycodework.beautifulcare.entity.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
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

    /**
     * Find all bookings for a staff member on a specific date, excluding those with the given status.
     *
     * @param staffId the staff member ID
     * @param date the date to check
     * @param status the status to exclude
     * @return a list of bookings
     */
    @Query("SELECT b FROM Booking b WHERE b.staff.id = :staffId AND CAST(b.appointmentTime AS LocalDate) = :date AND b.status != :status")
    List<Booking> findByStaffIdAndBookingDateAndStatusNot(
            @Param("staffId") UUID staffId,
            @Param("date") LocalDate date,
            @Param("status") BookingStatus status);
            
    /**
     * Find recent bookings with all necessary data loaded in a single query
     * 
     * @param pageable pagination info
     * @return list of bookings with eager loaded services and user data
     */
    @Query("SELECT DISTINCT b FROM Booking b " +
           "LEFT JOIN FETCH b.customer c " +
           "LEFT JOIN FETCH b.staff s " +
           "LEFT JOIN FETCH b.services " +
           "ORDER BY b.createdAt DESC")
    List<Booking> findRecentBookingsWithFullDetails(Pageable pageable);
    
    /**
     * Count bookings by status
     * 
     * @param status the booking status
     * @return number of bookings with the given status
     */
    long countByStatus(BookingStatus status);
    
    /**
     * Calculate total revenue from completed bookings
     * 
     * @return the sum of totalPrice from all completed bookings
     */
    @Query("SELECT SUM(b.totalPrice) FROM Booking b WHERE b.status = 'COMPLETED'")
    Double calculateTotalRevenue();
}