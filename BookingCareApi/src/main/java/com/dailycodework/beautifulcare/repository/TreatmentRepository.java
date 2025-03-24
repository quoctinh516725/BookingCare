package com.dailycodework.beautifulcare.repository;

import com.dailycodework.beautifulcare.entity.Treatment;
import com.dailycodework.beautifulcare.entity.enums.TreatmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Treatment entity operations.
 */
@Repository
public interface TreatmentRepository extends JpaRepository<Treatment, String> {

        /**
         * Find all treatments for a specific booking
         * 
         * @param bookingId The booking ID
         * @return List of treatments
         */
        List<Treatment> findByBookingId(String bookingId);

        /**
         * Find all treatments assigned to a specific specialist
         * 
         * @param specialistId The specialist ID
         * @return List of treatments
         */
        List<Treatment> findBySpecialistId(String specialistId);

        /**
         * Find all treatments for a specific booking and status
         * 
         * @param bookingId The booking ID
         * @param status    The treatment status
         * @return List of treatments
         */
        List<Treatment> findByBookingIdAndStatus(String bookingId, TreatmentStatus status);

        /**
         * Find all treatments for a specific specialist and status
         * 
         * @param specialistId The specialist ID
         * @param status       The treatment status
         * @return List of treatments
         */
        List<Treatment> findBySpecialistIdAndStatus(String specialistId, TreatmentStatus status);

        /**
         * Find all treatments that started between specific times
         * 
         * @param start The start time
         * @param end   The end time
         * @return List of treatments
         */
        List<Treatment> findByStartTimeBetween(LocalDateTime start, LocalDateTime end);

        /**
         * Find all treatments for a specific specialist that started between specific
         * times
         * 
         * @param specialistId The specialist ID
         * @param start        The start time
         * @param end          The end time
         * @return List of treatments
         */
        List<Treatment> findBySpecialistIdAndStartTimeBetween(String specialistId, LocalDateTime start,
                        LocalDateTime end);

        List<Treatment> findByStatus(TreatmentStatus status);

        Optional<Treatment> findFirstByBookingIdOrderByStartTimeDesc(String bookingId);

        List<Treatment> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);

        List<Treatment> findBySpecialistIdAndCreatedAtBetween(String specialistId, LocalDateTime startDate,
                        LocalDateTime endDate);

        Optional<Treatment> findFirstByBookingIdOrderByCreatedAtDesc(String bookingId);
}