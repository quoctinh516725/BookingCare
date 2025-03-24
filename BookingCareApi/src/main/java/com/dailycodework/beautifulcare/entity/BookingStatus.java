package com.dailycodework.beautifulcare.entity;

public enum BookingStatus {
    PENDING, // Chờ xác nhận
    CONFIRMED, // Đã xác nhận
    CHECKED_IN, // Đã check-in
    IN_PROGRESS, // Đang thực hiện
    COMPLETED, // Đã hoàn thành
    CHECKED_OUT, // Đã check-out
    CANCELLED // Đã hủy
}