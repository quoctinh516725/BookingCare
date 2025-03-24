package com.dailycodework.beautifulcare.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ServiceCategoryCreateRequest {
    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    private String imageUrl;
}