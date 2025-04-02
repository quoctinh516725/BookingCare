package com.dailycodework.beautifulcare.exception;

import lombok.Getter;

@Getter
public class BookingConflictException extends RuntimeException {
    
    private final String reason;
    
    public BookingConflictException(String message, String reason) {
        super(message);
        this.reason = reason;
    }

    public BookingConflictException(String message, Throwable cause) {
        super(message, cause);
        this.reason = "SYSTEM_ERROR"; // Default reason for exceptions with a cause
    }
}