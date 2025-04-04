package com.dailycodework.beautifulcare.mapper;

import com.dailycodework.beautifulcare.dto.request.PermissionRequest;
import com.dailycodework.beautifulcare.dto.response.PermissionResponse;
import com.dailycodework.beautifulcare.entity.Permission;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper để chuyển đổi giữa Entity và DTO cho đối tượng Permission
 */
@Component
public class PermissionMapper {
    
    /**
     * Chuyển đổi từ Entity sang DTO
     */
    public PermissionResponse toPermissionResponse(Permission permission) {
        if (permission == null) {
            return null;
        }
        
        return PermissionResponse.builder()
                .id(permission.getId())
                .name(permission.getName())
                .description(permission.getDescription())
                .code(permission.getCode())
                .createdAt(permission.getCreatedAt())
                .updatedAt(permission.getUpdatedAt())
                .build();
    }
    
    /**
     * Chuyển đổi từ DTO sang Entity
     */
    public Permission toPermission(PermissionRequest request) {
        if (request == null) {
            return null;
        }
        
        return Permission.builder()
                .name(request.getName())
                .description(request.getDescription())
                .code(request.getCode())
                .build();
    }
    
    /**
     * Cập nhật Entity từ Request DTO
     */
    public void updatePermission(Permission permission, PermissionRequest request) {
        if (permission == null || request == null) {
            return;
        }
        
        permission.setName(request.getName());
        permission.setDescription(request.getDescription());
        permission.setCode(request.getCode());
    }
    
    /**
     * Chuyển đổi danh sách Entity sang danh sách DTO
     */
    public List<PermissionResponse> toPermissionResponseList(List<Permission> permissions) {
        if (permissions == null) {
            return null;
        }
        
        return permissions.stream()
                .map(this::toPermissionResponse)
                .collect(Collectors.toList());
    }
} 