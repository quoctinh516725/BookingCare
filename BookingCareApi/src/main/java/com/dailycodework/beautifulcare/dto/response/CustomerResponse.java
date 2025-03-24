package com.dailycodework.beautifulcare.dto.response;

import com.dailycodework.beautifulcare.entity.SkinType;
import com.dailycodework.beautifulcare.entity.UserRole;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class CustomerResponse {
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
    private String address;
    private SkinType skinType;
}