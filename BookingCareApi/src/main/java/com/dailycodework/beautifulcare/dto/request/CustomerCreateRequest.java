package com.dailycodework.beautifulcare.dto.request;

import com.dailycodework.beautifulcare.entity.SkinType;
import com.dailycodework.beautifulcare.entity.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

/**
 * DTO class for customer creation requests.
 * This class contains all fields needed to create a new customer account.
 * The role field is optional and allows administrators to specify a role other
 * than CUSTOMER.
 * 
 * @author Beautiful Care API Team
 * @version 1.1
 * @since 2025-03-21
 */
@Data
public class CustomerCreateRequest {
    @NotBlank(message = "Username is required")
    @Size(min = 4, max = 50, message = "Username must be between 4 and 50 characters")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @Pattern(regexp = "^[0-9]{10,15}$", message = "Phone number should be valid")
    private String phone;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    private LocalDate dob;
    private String address;
    private SkinType skinType;

    /**
     * Optional role field that can be set by administrators.
     * If not provided, the default CUSTOMER role will be assigned.
     */
    private UserRole role;
}