package com.dailycodework.beautifulcare.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO cho request tạo hoặc cập nhật quyền
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermissionRequest {
    @NotBlank(message = "Tên quyền không được để trống")
    private String name;
    
    @NotBlank(message = "Mô tả quyền không được để trống")
    private String description;
    
    @NotBlank(message = "Mã quyền không được để trống")
    private String code;
} 