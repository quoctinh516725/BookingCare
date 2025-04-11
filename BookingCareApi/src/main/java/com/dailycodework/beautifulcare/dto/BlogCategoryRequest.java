package com.dailycodework.beautifulcare.dto;

import com.dailycodework.beautifulcare.entity.CategoryStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho request tạo mới hoặc cập nhật thông tin danh mục blog
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlogCategoryRequest {
    @NotBlank(message = "Tên danh mục không được để trống")
    @Size(max = 100, message = "Tên danh mục không được vượt quá 100 ký tự")
    private String name;
    
    private String slug;
    
    @Size(max = 500, message = "Mô tả không được vượt quá 500 ký tự")
    private String description;
    
    private CategoryStatus status;
} 