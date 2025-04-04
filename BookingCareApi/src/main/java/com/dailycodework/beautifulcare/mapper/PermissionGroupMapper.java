package com.dailycodework.beautifulcare.mapper;

import com.dailycodework.beautifulcare.dto.request.PermissionGroupRequest;
import com.dailycodework.beautifulcare.dto.response.PermissionGroupResponse;
import com.dailycodework.beautifulcare.dto.response.PermissionResponse;
import com.dailycodework.beautifulcare.entity.Permission;
import com.dailycodework.beautifulcare.entity.PermissionGroup;
import com.dailycodework.beautifulcare.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper để chuyển đổi giữa Entity và DTO cho đối tượng PermissionGroup
 */
@Component
@RequiredArgsConstructor
public class PermissionGroupMapper {
    
    private final PermissionMapper permissionMapper;
    
    /**
     * Chuyển đổi từ Entity sang DTO
     */
    public PermissionGroupResponse toPermissionGroupResponse(PermissionGroup group) {
        if (group == null) {
            return null;
        }
        
        // Chuyển đổi Set Permission sang Set PermissionResponse
        var permissionResponses = group.getPermissions().stream()
                .map(permissionMapper::toPermissionResponse)
                .collect(Collectors.toSet());
        
        return PermissionGroupResponse.builder()
                .id(group.getId())
                .name(group.getName())
                .description(group.getDescription())
                .permissions(permissionResponses)
                .userCount(group.getUsers() != null ? group.getUsers().size() : 0)
                .createdAt(group.getCreatedAt())
                .updatedAt(group.getUpdatedAt())
                .build();
    }
    
    /**
     * Chuyển đổi từ DTO sang Entity
     */
    public PermissionGroup toPermissionGroup(PermissionGroupRequest request) {
        if (request == null) {
            return null;
        }
        
        return PermissionGroup.builder()
                .name(request.getName())
                .description(request.getDescription())
                .permissions(new HashSet<>()) // Permissions được thêm sau khi lưu
                .build();
    }
    
    /**
     * Chuyển đổi danh sách Entity sang danh sách DTO
     */
    public List<PermissionGroupResponse> toPermissionGroupResponseList(List<PermissionGroup> groups) {
        if (groups == null) {
            return null;
        }
        
        return groups.stream()
                .map(this::toPermissionGroupResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Cập nhật thông tin của entity từ DTO
     */
    public void updatePermissionGroup(PermissionGroup group, PermissionGroupRequest request) {
        if (request == null || group == null) {
            return;
        }
        
        group.setName(request.getName());
        group.setDescription(request.getDescription());
        // Permissions được cập nhật riêng thông qua service
    }
} 