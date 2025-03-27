package com.dailycodework.beautifulcare.entity;

/**
 * Trạng thái đơn giản hóa cho booking.
 */
public enum BookingStatus {
    PENDING, // Chờ xác nhận
    CONFIRMED, // Đã xác nhận
    COMPLETED, // Đã hoàn thành
    CANCELLED, // Đã hủy
    NO_SHOW
}