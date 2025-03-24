package com.dailycodework.beautifulcare.repository;

import com.dailycodework.beautifulcare.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, String> {
    List<Payment> findByBookingId(String bookingId);

    List<Payment> findByPaid(boolean paid);

    List<Payment> findByPaymentDateBetween(LocalDateTime start, LocalDateTime end);

    List<Payment> findByPaymentMethod(String paymentMethod);

    List<Payment> findByBookingCustomerId(String customerId);
}