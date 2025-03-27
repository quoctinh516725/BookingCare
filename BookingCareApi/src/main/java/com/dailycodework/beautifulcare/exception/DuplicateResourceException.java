package com.dailycodework.beautifulcare.exception;

/**
 * Exception thrown when trying to create a resource that already exists
 * For example, trying to add feedback for a booking that already has feedback
 */
public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String message) {
        super(message);
    }

    public DuplicateResourceException(String message, Throwable cause) {
        super(message, cause);
    }
}