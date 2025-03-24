package com.dailycodework.beautifulcare.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceResponse {
    private String id;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer durationMinutes;
    private String categoryId;
    private String categoryName;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}