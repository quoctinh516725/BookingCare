package com.dailycodework.beautifulcare.entity.enums;

/**
 * Enum representing the possible states of a treatment.
 */
public enum TreatmentStatus {
    /**
     * Treatment has been scheduled but not yet started
     */
    SCHEDULED,

    /**
     * Treatment is currently in progress
     */
    IN_PROGRESS,

    /**
     * Treatment has been completed
     */
    COMPLETED,

    /**
     * Treatment has been cancelled
     */
    CANCELLED
}