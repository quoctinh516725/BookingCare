package com.dailycodework.beautifulcare.exception;

import org.springframework.http.HttpStatus;

public enum ErrorCode {
    // Authentication errors
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "Invalid username or password"),
    TOKEN_EXPIRED(HttpStatus.UNAUTHORIZED, "Token has expired"),
    TOKEN_INVALID(HttpStatus.UNAUTHORIZED, "Token is invalid"),
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "Unauthorized access"),

    // User errors
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "User not found"),
    USER_ALREADY_EXISTS(HttpStatus.CONFLICT, "User already exists"),
    USER_EMAIL_EXISTS(HttpStatus.CONFLICT, "Email already exists"),
    INVALID_PASSWORD(HttpStatus.BAD_REQUEST, "Invalid password"),

    // Service errors
    SERVICE_NOT_FOUND(HttpStatus.NOT_FOUND, "Service not found"),
    SERVICE_ALREADY_EXISTS(HttpStatus.CONFLICT, "Service already exists"),

    // Specialist errors
    SPECIALIST_NOT_FOUND(HttpStatus.NOT_FOUND, "Specialist not found"),
    SPECIALIST_ALREADY_EXISTS(HttpStatus.CONFLICT, "Specialist already exists"),

    // Booking errors
    BOOKING_NOT_FOUND(HttpStatus.NOT_FOUND, "Booking not found"),
    BOOKING_ALREADY_EXISTS(HttpStatus.CONFLICT, "Booking already exists"),
    INVALID_BOOKING_TIME(HttpStatus.BAD_REQUEST, "Invalid booking time"),
    BOOKING_CANNOT_BE_CANCELLED(HttpStatus.BAD_REQUEST, "Booking cannot be cancelled in current status"),
    BOOKING_INVALID_STATUS(HttpStatus.BAD_REQUEST, "Invalid booking status for this operation"),

    // General errors
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error"),
    INVALID_REQUEST(HttpStatus.BAD_REQUEST, "Invalid request"),
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "Resource not found"),
    RESOURCE_ALREADY_EXISTS(HttpStatus.CONFLICT, "Resource already exists"),

    // User related errors
    USER_EMAIL_ALREADY_EXISTS(HttpStatus.CONFLICT, "User with this email already exists"),
    USER_PHONE_ALREADY_EXISTS(HttpStatus.CONFLICT, "User with this phone number already exists"),
    USER_INVALID_CREDENTIALS(HttpStatus.BAD_REQUEST, "Invalid credentials"),
    USER_INVALID_TOKEN(HttpStatus.BAD_REQUEST, "Invalid token"),
    USER_TOKEN_EXPIRED(HttpStatus.UNAUTHORIZED, "Token expired"),

    // Customer related errors
    CUSTOMER_NOT_FOUND(HttpStatus.NOT_FOUND, "Customer not found"),
    CUSTOMER_ALREADY_EXISTS(HttpStatus.CONFLICT, "Customer already exists"),

    // Booking related errors
    BOOKING_INVALID_DATE(HttpStatus.BAD_REQUEST, "Invalid booking date"),
    BOOKING_INVALID_DURATION(HttpStatus.BAD_REQUEST, "Invalid booking duration"),
    BOOKING_INVALID_SERVICES(HttpStatus.BAD_REQUEST, "Invalid services"),
    BOOKING_INVALID_SPECIALIST(HttpStatus.BAD_REQUEST, "Invalid specialist"),
    BOOKING_INVALID_CUSTOMER(HttpStatus.BAD_REQUEST, "Invalid customer"),

    // Service related errors
    SERVICE_INVALID_PRICE(HttpStatus.BAD_REQUEST, "Invalid service price"),
    SERVICE_INVALID_DURATION(HttpStatus.BAD_REQUEST, "Invalid service duration"),

    // Specialist related errors
    SPECIALIST_INVALID_SERVICES(HttpStatus.BAD_REQUEST, "Invalid specialist services"),
    SPECIALIST_INVALID_SCHEDULE(HttpStatus.BAD_REQUEST, "Invalid specialist schedule"),

    // General errors
    FORBIDDEN(HttpStatus.FORBIDDEN, "Forbidden");

    private final HttpStatus httpStatus;
    private final String message;

    ErrorCode(HttpStatus httpStatus, String message) {
        this.httpStatus = httpStatus;
        this.message = message;
    }

    ErrorCode(String message) {
        this.httpStatus = HttpStatus.BAD_REQUEST;
        this.message = message;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }

    public String getMessage() {
        return message;
    }
}
