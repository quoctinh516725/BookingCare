package com.dailycodework.beautifulcare.dto;

import com.dailycodework.beautifulcare.entity.CategoryStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO cho thông tin danh mục blog
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlogCategoryDTO {
    private UUID id;
    private String name;
    private String slug;
    private String description;
    private CategoryStatus status;
    private int blogCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 