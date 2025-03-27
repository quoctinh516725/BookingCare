package com.dailycodework.beautifulcare.exception;

import org.springframework.http.HttpStatus;

public class ResourceAlreadyExistsException extends AppException {
    public ResourceAlreadyExistsException(String message) {
        super(ErrorCode.BOOKING_NOT_FOUND, message);
    }
}