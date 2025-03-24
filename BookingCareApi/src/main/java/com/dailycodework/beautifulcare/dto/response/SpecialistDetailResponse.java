package com.dailycodework.beautifulcare.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO class for detailed specialist responses.
 * This class provides a comprehensive view of a specialist's information,
 * including personal details, professional qualifications, services offered,
 * and system metadata.
 * 
 * It is used for API responses when a complete specialist profile is requested.
 * 
 * @author Beautiful Care API Team
 * @version 1.0
 * @since 2025-03-21
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpecialistDetailResponse {
    /**
     * The unique identifier of the specialist.
     */
    private String id;

    /**
     * The unique identifier of the associated user account.
     */
    private String userId;

    /**
     * The username of the specialist.
     */
    private String username;

    /**
     * The email address of the specialist.
     */
    private String email;

    /**
     * The first name of the specialist.
     */
    private String firstName;

    /**
     * The last name of the specialist.
     */
    private String lastName;

    /**
     * The phone number of the specialist.
     */
    private String phone;

    /**
     * The date of birth of the specialist.
     */
    private LocalDate dob;

    /**
     * The specialization area of the specialist.
     */
    private String specialization;

    /**
     * The biographical information of the specialist.
     */
    private String bio;

    /**
     * The expertise description of the specialist.
     */
    private String expertise;

    /**
     * The number of years of professional experience.
     */
    private Integer yearsOfExperience;

    /**
     * The URL to the specialist's profile avatar image.
     */
    private String avatar;

    /**
     * The list of certifications held by the specialist.
     */
    private List<String> certifications;

    /**
     * The list of services offered by the specialist.
     */
    private List<ServiceResponse> services;

    /**
     * Flag indicating if the specialist's account is active.
     */
    private boolean active;

    /**
     * The timestamp when the specialist was first created in the system.
     */
    private LocalDateTime createdAt;

    /**
     * The timestamp when the specialist was last updated in the system.
     */
    private LocalDateTime updatedAt;
}