package com.dailycodework.beautifulcare.exception;

/**
 * Exception thrown when an operation is not valid in the current context
 * For example, trying to update a booking that has already been completed
 */
public class InvalidOperationException extends RuntimeException {

    public InvalidOperationException(String message) {
        super(message);
    }

    public InvalidOperationException(String message, Throwable cause) {
        super(message, cause);
    }
}