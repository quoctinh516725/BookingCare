package com.dailycodework.beautifulcare.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ServiceCategoryRequest {
    @NotBlank(message = "Tên danh mục không được để trống")
    @Size(min = 2, max = 100, message = "Tên danh mục phải từ 2-100 ký tự")
    private String name;
    
    @NotBlank(message = "Mã danh mục không được để trống")
    @Pattern(regexp = "^[A-Za-z0-9_-]+$", message = "Mã danh mục chỉ chứa chữ cái, số, gạch ngang và gạch dưới")
    @Size(min = 2, max = 50, message = "Mã danh mục phải từ 2-50 ký tự")
    private String code;
    
    @Size(max = 1000, message = "Mô tả không được vượt quá 1000 ký tự")
    private String description;
    
    private Boolean isActive;
} 