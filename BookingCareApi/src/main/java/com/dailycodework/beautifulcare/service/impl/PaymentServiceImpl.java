package com.dailycodework.beautifulcare.service.impl;

import com.dailycodework.beautifulcare.dto.request.PaymentCreateRequest;
import com.dailycodework.beautifulcare.dto.request.PaymentUpdateRequest;
import com.dailycodework.beautifulcare.dto.response.PaymentMethodResponse;
import com.dailycodework.beautifulcare.dto.response.PaymentResponse;
import com.dailycodework.beautifulcare.entity.Booking;
import com.dailycodework.beautifulcare.entity.Payment;
import com.dailycodework.beautifulcare.exception.ResourceNotFoundException;
import com.dailycodework.beautifulcare.repository.BookingRepository;
import com.dailycodework.beautifulcare.repository.PaymentRepository;
import com.dailycodework.beautifulcare.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;

    @Override
    @Transactional
    public PaymentResponse createPayment(PaymentCreateRequest request) {
        // Tìm booking tương ứng
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Booking not found with ID: " + request.getBookingId()));

        // Kiểm tra xem booking đã có payment chưa
        if (booking.getPayment() != null) {
            throw new IllegalStateException("Booking already has a payment");
        }

        // Tạo payment mới
        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setTransactionId(request.getTransactionId());
        payment.setPaid(false);
        payment.setCreatedAt(LocalDateTime.now());

        // Lưu payment
        Payment savedPayment = paymentRepository.save(payment);

        // Chuyển đổi sang response
        return mapToPaymentResponse(savedPayment);
    }

    @Override
    public List<PaymentResponse> getAllPayments(String bookingId) {
        List<Payment> payments;

        if (bookingId != null) {
            payments = paymentRepository.findByBookingId(bookingId);
        } else {
            payments = paymentRepository.findAll();
        }

        return payments.stream()
                .map(this::mapToPaymentResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PaymentResponse getPaymentById(String id) {
        Payment payment = findPaymentById(id);
        return mapToPaymentResponse(payment);
    }

    @Override
    @Transactional
    public PaymentResponse updatePayment(String id, PaymentUpdateRequest request) {
        Payment payment = findPaymentById(id);

        // Cập nhật thông tin
        if (request.getAmount() != null) {
            payment.setAmount(request.getAmount());
        }

        if (request.getPaymentMethod() != null) {
            payment.setPaymentMethod(request.getPaymentMethod());
        }

        if (request.getTransactionId() != null) {
            payment.setTransactionId(request.getTransactionId());
        }

        if (request.getPaid() != null) {
            payment.setPaid(request.getPaid());
        }

        if (request.getPaymentDate() != null) {
            payment.setPaymentDate(request.getPaymentDate());
        }

        Payment updatedPayment = paymentRepository.save(payment);
        return mapToPaymentResponse(updatedPayment);
    }

    @Override
    @Transactional
    public PaymentResponse processPayment(String id) {
        Payment payment = findPaymentById(id);

        // Kiểm tra xem payment đã được xử lý chưa
        if (payment.isPaid()) {
            throw new IllegalStateException("Payment has already been processed");
        }

        // Xử lý payment
        payment.setPaid(true);
        payment.setPaymentDate(LocalDateTime.now());

        Payment processedPayment = paymentRepository.save(payment);
        return mapToPaymentResponse(processedPayment);
    }

    @Override
    public List<PaymentMethodResponse> getPaymentMethods() {
        // Danh sách các phương thức thanh toán
        List<PaymentMethodResponse> methods = new ArrayList<>();

        methods.add(PaymentMethodResponse.builder()
                .code("CASH")
                .name("Cash")
                .description("Pay with cash at the salon")
                .active(true)
                .build());

        methods.add(PaymentMethodResponse.builder()
                .code("CARD")
                .name("Credit/Debit Card")
                .description("Pay with credit or debit card")
                .active(true)
                .build());

        methods.add(PaymentMethodResponse.builder()
                .code("BANK_TRANSFER")
                .name("Bank Transfer")
                .description("Pay via bank transfer")
                .active(true)
                .build());

        methods.add(PaymentMethodResponse.builder()
                .code("MOMO")
                .name("MoMo")
                .description("Pay with MoMo e-wallet")
                .active(true)
                .build());

        methods.add(PaymentMethodResponse.builder()
                .code("ZALO_PAY")
                .name("ZaloPay")
                .description("Pay with ZaloPay")
                .active(true)
                .build());

        methods.add(PaymentMethodResponse.builder()
                .code("VNPAY")
                .name("VNPay")
                .description("Pay with VNPay")
                .active(true)
                .build());

        return methods;
    }

    // Helper methods
    private Payment findPaymentById(String id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with ID: " + id));
    }

    private PaymentResponse mapToPaymentResponse(Payment payment) {
        // Map đối tượng Payment sang PaymentResponse
        return PaymentResponse.builder()
                .id(payment.getId())
                .bookingId(payment.getBooking().getId())
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .transactionId(payment.getTransactionId())
                .paid(payment.isPaid())
                .paymentDate(payment.getPaymentDate())
                .createdAt(payment.getCreatedAt())
                // Không map trường booking để tránh circular reference
                .build();
    }
}