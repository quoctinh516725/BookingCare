package com.dailycodework.beautifulcare.service.impl;

import com.dailycodework.beautifulcare.dto.request.PaymentRequest;
import com.dailycodework.beautifulcare.dto.response.PaymentResponse;
import com.dailycodework.beautifulcare.entity.Booking;
import com.dailycodework.beautifulcare.entity.Payment;
import com.dailycodework.beautifulcare.entity.PaymentStatus;
import com.dailycodework.beautifulcare.entity.User;
import com.dailycodework.beautifulcare.exception.InvalidOperationException;
import com.dailycodework.beautifulcare.exception.ResourceNotFoundException;
import com.dailycodework.beautifulcare.mapper.PaymentMapper;
import com.dailycodework.beautifulcare.repository.BookingRepository;
import com.dailycodework.beautifulcare.repository.PaymentRepository;
import com.dailycodework.beautifulcare.repository.UserRepository;
import com.dailycodework.beautifulcare.security.SecurityUtils;
import com.dailycodework.beautifulcare.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final PaymentMapper paymentMapper;
    private final SecurityUtils securityUtils;

    @Override
    @Transactional
    public PaymentResponse createPaymentForBooking(UUID bookingId) {
        log.info("Creating payment for booking ID: {}", bookingId);
        
        // Kiểm tra booking tồn tại
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with ID: " + bookingId));
        
        // Kiểm tra quyền: người tạo phải là khách hàng của booking hoặc admin/staff
        User currentUser = securityUtils.getCurrentUser();
        boolean isCustomer = booking.getCustomer() != null && booking.getCustomer().getId().equals(currentUser.getId());
        boolean isAdminOrStaff = securityUtils.isAdminOrStaff();
        
        if (!isCustomer && !isAdminOrStaff) {
            log.warn("User {} attempted to create payment for booking {} without permission", 
                    currentUser.getId(), bookingId);
            throw new AccessDeniedException("You don't have permission to create payment for this booking");
        }
        
        // Kiểm tra xem đã có thanh toán cho booking này chưa
        if (paymentRepository.existsByBookingId(bookingId)) {
            log.info("Payment already exists for booking ID: {}", bookingId);
            return getPaymentByBookingId(bookingId);
        }
        
        // Tạo payment mới
        Payment payment = paymentMapper.toPayment(booking);
        payment = paymentRepository.save(payment);
        
        log.info("Payment created successfully with ID: {} and code: {}", payment.getId(), payment.getPaymentCode());
        return paymentMapper.toPaymentResponse(payment);
    }

    @Override
    public PaymentResponse getPaymentById(UUID id) {
        log.info("Fetching payment with ID: {}", id);
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with ID: " + id));
        
        return paymentMapper.toPaymentResponse(payment);
    }

    @Override
    public PaymentResponse getPaymentByCode(String paymentCode) {
        log.info("Fetching payment with code: {}", paymentCode);
        Payment payment = paymentRepository.findByPaymentCode(paymentCode)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with code: " + paymentCode));
        
        return paymentMapper.toPaymentResponse(payment);
    }

    @Override
    public PaymentResponse getPaymentByBookingId(UUID bookingId) {
        log.info("Fetching payment for booking ID: {}", bookingId);
        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for booking ID: " + bookingId));
        
        return paymentMapper.toPaymentResponse(payment);
    }

    @Override
    public List<PaymentResponse> getAllPayments() {
        log.info("Fetching all payments");
        return paymentRepository.findAll().stream()
                .map(paymentMapper::toPaymentResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<PaymentResponse> getPaymentsByStatus(PaymentStatus status) {
        log.info("Fetching payments with status: {}", status);
        return paymentRepository.findByStatus(status).stream()
                .map(paymentMapper::toPaymentResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PaymentResponse updatePaymentStatus(UUID id, PaymentStatus status) {
        log.info("Updating payment status: {} for payment ID: {}", status, id);
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with ID: " + id));
        
        // Kiểm tra trạng thái hợp lệ
        validateStatusTransition(payment.getStatus(), status);
        
        // Cập nhật trạng thái
        payment.setStatus(status);
        
        // Cập nhật thời gian xử lý
        if (status == PaymentStatus.COMPLETED) {
            payment.setPaidAt(LocalDateTime.now());
        } else if (status == PaymentStatus.REFUNDED) {
            payment.setRefundedAt(LocalDateTime.now());
        }
        
        // Lưu người xử lý
        User currentUser = securityUtils.getCurrentUser();
        payment.setProcessedBy(currentUser);
        
        payment = paymentRepository.save(payment);
        log.info("Payment status updated successfully to: {} for ID: {}", status, id);
        
        return paymentMapper.toPaymentResponse(payment);
    }

    @Override
    @Transactional
    public PaymentResponse confirmPayment(PaymentRequest request) {
        log.info("Confirming payment for booking ID: {}", request.getBookingId());
        
        // Tìm payment dựa vào booking ID
        Payment payment = paymentRepository.findByBookingId(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for booking ID: " + request.getBookingId()));
        
        // Kiểm tra trạng thái hiện tại
        if (payment.getStatus() != PaymentStatus.UNPAID) {
            throw new InvalidOperationException("Cannot confirm payment with status: " + payment.getStatus());
        }
        
        // Cập nhật thông tin thanh toán
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setPaidAt(LocalDateTime.now());
        payment.setPaymentMethod(request.getPaymentMethod());
        
        if (request.getTransactionId() != null) {
            payment.setTransactionId(request.getTransactionId());
        }
        
        // Cập nhật số tiền nếu được chỉ định
        if (request.getAmount() != null) {
            payment.setAmount(request.getAmount());
        }
        
        // Lưu người xử lý
        User processedBy;
        if (request.getProcessedById() != null) {
            processedBy = userRepository.findById(request.getProcessedById())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + request.getProcessedById()));
        } else {
            processedBy = securityUtils.getCurrentUser();
        }
        payment.setProcessedBy(processedBy);
        
        // Lưu payment
        payment = paymentRepository.save(payment);
        log.info("Payment confirmed successfully with ID: {}", payment.getId());
        
        return paymentMapper.toPaymentResponse(payment);
    }

    @Override
    @Transactional
    public PaymentResponse refundPayment(UUID id) {
        log.info("Refunding payment with ID: {}", id);
        
        // Tìm payment
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with ID: " + id));
        
        // Kiểm tra trạng thái hiện tại
        if (payment.getStatus() != PaymentStatus.COMPLETED) {
            throw new InvalidOperationException("Cannot refund payment with status: " + payment.getStatus());
        }
        
        // Cập nhật trạng thái
        payment.setStatus(PaymentStatus.REFUNDED);
        payment.setRefundedAt(LocalDateTime.now());
        
        // Lưu người xử lý
        User currentUser = securityUtils.getCurrentUser();
        payment.setProcessedBy(currentUser);
        
        payment = paymentRepository.save(payment);
        log.info("Payment refunded successfully with ID: {}", id);
        
        return paymentMapper.toPaymentResponse(payment);
    }
    
    /**
     * Xác thực quá trình chuyển trạng thái thanh toán
     */
    private void validateStatusTransition(PaymentStatus currentStatus, PaymentStatus newStatus) {
        if (currentStatus == newStatus) {
            return; // Không thay đổi trạng thái
        }
        
        // Kiểm tra các luồng trạng thái hợp lệ
        switch (currentStatus) {
            case UNPAID:
                if (newStatus != PaymentStatus.COMPLETED) {
                    throw new InvalidOperationException("Cannot transition from " + currentStatus + " to " + newStatus);
                }
                break;
            case COMPLETED:
                if (newStatus != PaymentStatus.REFUNDED) {
                    throw new InvalidOperationException("Cannot transition from " + currentStatus + " to " + newStatus);
                }
                break;
            case REFUNDED:
                throw new InvalidOperationException("Cannot change status of a refunded payment");
            default:
                throw new InvalidOperationException("Unsupported payment status: " + currentStatus);
        }
    }
} 