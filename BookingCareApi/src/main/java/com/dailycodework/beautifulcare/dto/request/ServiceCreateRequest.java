package com.dailycodework.beautifulcare.dto.request;

import com.dailycodework.beautifulcare.entity.SkinType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ServiceCreateRequest {
    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private BigDecimal price;

    @NotNull(message = "Duration is required")
    @Positive(message = "Duration must be positive")
    private Integer duration;

    @NotBlank(message = "Category ID is required")
    private String categoryId;

    private String imageUrl;

    private SkinType suitableForSkinType;
}