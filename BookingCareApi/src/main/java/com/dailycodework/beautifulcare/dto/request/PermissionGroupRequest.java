package com.dailycodework.beautifulcare.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

/**
 * DTO cho request tạo hoặc cập nhật nhóm quyền
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermissionGroupRequest {
    @NotBlank(message = "Tên nhóm quyền không được để trống")
    private String name;
    
    @NotBlank(message = "Mô tả nhóm quyền không được để trống")
    private String description;
    
    // Danh sách ID của các quyền thuộc nhóm (tuỳ chọn)
    private List<UUID> permissionIds;
} 