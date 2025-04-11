package com.dailycodework.beautifulcare.dto;

import com.dailycodework.beautifulcare.entity.SpecialistStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * DTO cho thông tin chuyên gia
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpecialistDTO {
    private UUID id;
    private UUID userId;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String specialty;
    private String qualification;
    private String experience;
    private Float rating;
    private String avatarUrl;
    private List<String> images;
    private String workingHours;
    private String biography;
    private String description;
    private SpecialistStatus status;
} 