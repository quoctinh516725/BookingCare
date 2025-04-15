package com.dailycodework.beautifulcare.repository;

import com.dailycodework.beautifulcare.entity.Payment;
import com.dailycodework.beautifulcare.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    Optional<Payment> findByBookingId(UUID bookingId);
    Optional<Payment> findByPaymentCode(String paymentCode);
    List<Payment> findByStatus(PaymentStatus status);
    boolean existsByBookingId(UUID bookingId);
} 