package com.dailycodework.beautifulcare.dto.request;

import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ServiceUpdateRequest {
    private String name;
    private String description;

    @Positive(message = "Price must be positive")
    private BigDecimal price;

    @Positive(message = "Duration must be positive")
    private Integer duration;

    private String categoryId;
    private String imageUrl;
}