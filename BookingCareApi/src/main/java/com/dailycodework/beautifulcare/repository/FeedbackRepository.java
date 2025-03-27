package com.dailycodework.beautifulcare.repository;

import com.dailycodework.beautifulcare.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, UUID> {
    List<Feedback> findByBookingId(UUID bookingId);

    List<Feedback> findByCustomerId(UUID customerId);

    boolean existsByBookingId(UUID bookingId);

    boolean existsByBookingIdAndCustomerId(UUID bookingId, UUID customerId);
}