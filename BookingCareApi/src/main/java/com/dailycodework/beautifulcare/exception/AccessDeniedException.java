package com.dailycodework.beautifulcare.exception;

/**
 * Exception thrown when a user tries to access a resource without proper
 * permissions
 */
public class AccessDeniedException extends RuntimeException {

    public AccessDeniedException(String message) {
        super(message);
    }

    public AccessDeniedException(String message, Throwable cause) {
        super(message, cause);
    }
}