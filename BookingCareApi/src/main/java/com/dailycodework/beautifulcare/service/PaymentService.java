package com.dailycodework.beautifulcare.service;

import com.dailycodework.beautifulcare.dto.request.PaymentRequest;
import com.dailycodework.beautifulcare.dto.response.PaymentResponse;
import com.dailycodework.beautifulcare.entity.PaymentStatus;

import java.util.List;
import java.util.UUID;

/**
 * Service interface for managing payments
 */
public interface PaymentService {
    
    /**
     * Tạo thanh toán mới khi đặt lịch
     */
    PaymentResponse createPaymentForBooking(UUID bookingId);
    
    /**
     * Lấy thông tin thanh toán theo ID
     */
    PaymentResponse getPaymentById(UUID id);
    
    /**
     * Lấy thông tin thanh toán theo mã thanh toán
     */
    PaymentResponse getPaymentByCode(String paymentCode);
    
    /**
     * Lấy thông tin thanh toán theo booking
     */
    PaymentResponse getPaymentByBookingId(UUID bookingId);
    
    /**
     * Lấy danh sách tất cả các thanh toán
     */
    List<PaymentResponse> getAllPayments();
    
    /**
     * Lấy danh sách thanh toán theo trạng thái
     */
    List<PaymentResponse> getPaymentsByStatus(PaymentStatus status);
    
    /**
     * Cập nhật trạng thái thanh toán
     */
    PaymentResponse updatePaymentStatus(UUID id, PaymentStatus status);
    
    /**
     * Xác nhận thanh toán
     */
    PaymentResponse confirmPayment(PaymentRequest request);
    
    /**
     * Hoàn tiền cho thanh toán
     */
    PaymentResponse refundPayment(UUID id);
} 