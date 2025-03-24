package com.dailycodework.beautifulcare.dto.response;

import com.dailycodework.beautifulcare.entity.UserRole;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Data
public class SpecialistResponse {
    private String id;
    private String username;
    private String email;
    private String phone;
    private String firstName;
    private String lastName;
    private LocalDate dob;
    private String avatar;
    private UserRole role;
    private boolean active;
    private LocalDateTime createdAt;

    private String bio;
    private String expertise;
    private int yearsOfExperience;
    private String certifications;

    private Set<ServiceResponse> services;
}