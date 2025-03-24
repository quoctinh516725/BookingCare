package com.dailycodework.beautifulcare.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.util.Set;

@Data
public class SpecialistUpdateRequest {
    @Size(min = 4, max = 50, message = "Username must be between 4 and 50 characters")
    private String username;

    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @Email(message = "Email should be valid")
    private String email;

    @Pattern(regexp = "^[0-9]{10,15}$", message = "Phone number should be valid")
    private String phone;

    private String firstName;

    private String lastName;

    private LocalDate dob;

    private String bio;

    private String expertise;

    @Min(value = 0, message = "Years of experience must be at least 0")
    private Integer yearsOfExperience;

    private String certifications;

    private Set<String> serviceIds;
}