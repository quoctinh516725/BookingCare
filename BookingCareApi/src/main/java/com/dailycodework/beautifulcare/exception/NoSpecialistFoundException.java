package com.dailycodework.beautifulcare.exception;

/**
 * Exception thrown when no specialist is found
 * This can happen when trying to book with a staff that is not a specialist
 * or when no specialists exist in the system
 */
public class NoSpecialistFoundException extends RuntimeException {
    
    public NoSpecialistFoundException(String message) {
        super(message);
    }
    
    public NoSpecialistFoundException(String message, Throwable cause) {
        super(message, cause);
    }
} 