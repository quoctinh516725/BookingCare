package com.dailycodework.beautifulcare.controller;

import com.dailycodework.beautifulcare.dto.request.PermissionGroupRequest;
import com.dailycodework.beautifulcare.dto.request.PermissionRequest;
import com.dailycodework.beautifulcare.dto.response.PermissionGroupResponse;
import com.dailycodework.beautifulcare.dto.response.PermissionResponse;
import com.dailycodework.beautifulcare.security.HasPermission;
import com.dailycodework.beautifulcare.service.AuthService;
import com.dailycodework.beautifulcare.service.PermissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST controller để quản lý quyền và nhóm quyền
 */
@RestController
@RequestMapping("/api/v1/permissions")
@RequiredArgsConstructor
@Tag(name = "Permission", description = "APIs quản lý quyền hạn và nhóm quyền")
@PreAuthorize("hasRole('ADMIN')")
@Slf4j
public class PermissionController {
    private final PermissionService permissionService;
    private final AuthService authService;
    
    // ============ Quản lý quyền (Permission) ============
    
    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả các quyền")
    @HasPermission("permission:view")
    public ResponseEntity<List<PermissionResponse>> getAllPermissions() {
        log.info("GET /api/v1/permissions: Lấy danh sách tất cả các quyền");
        return ResponseEntity.ok(permissionService.getAllPermissions());
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông tin quyền theo ID")
    @HasPermission("permission:view")
    public ResponseEntity<PermissionResponse> getPermissionById(@PathVariable UUID id) {
        log.info("GET /api/v1/permissions/{}: Lấy thông tin quyền theo ID", id);
        return ResponseEntity.ok(permissionService.getPermissionById(id));
    }
    
    @PostMapping
    @Operation(summary = "Tạo quyền mới")
    @HasPermission("permission:create")
    public ResponseEntity<PermissionResponse> createPermission(@Valid @RequestBody PermissionRequest request) {
        log.info("POST /api/v1/permissions: Tạo quyền mới: {}", request.getName());
        return new ResponseEntity<>(permissionService.createPermission(request), HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật thông tin quyền")
    @HasPermission("permission:update")
    public ResponseEntity<PermissionResponse> updatePermission(
            @PathVariable UUID id,
            @Valid @RequestBody PermissionRequest request) {
        log.info("PUT /api/v1/permissions/{}: Cập nhật thông tin quyền", id);
        return ResponseEntity.ok(permissionService.updatePermission(id, request));
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa quyền")
    @HasPermission("permission:delete")
    public ResponseEntity<Void> deletePermission(@PathVariable UUID id) {
        log.info("DELETE /api/v1/permissions/{}: Xóa quyền", id);
        permissionService.deletePermission(id);
        return ResponseEntity.noContent().build();
    }
    
    // ============ Quản lý nhóm quyền (Permission Group) ============
    
    @GetMapping("/groups")
    @Operation(summary = "Lấy danh sách tất cả các nhóm quyền")
    @HasPermission("permission_group:view")
    public ResponseEntity<List<PermissionGroupResponse>> getAllPermissionGroups() {
        log.info("GET /api/v1/permissions/groups: Lấy danh sách tất cả các nhóm quyền");
        return ResponseEntity.ok(permissionService.getAllPermissionGroups());
    }
    
    @GetMapping("/groups/{id}")
    @Operation(summary = "Lấy thông tin nhóm quyền theo ID")
    @HasPermission("permission_group:view")
    public ResponseEntity<PermissionGroupResponse> getPermissionGroupById(@PathVariable UUID id) {
        log.info("GET /api/v1/permissions/groups/{}: Lấy thông tin nhóm quyền theo ID", id);
        return ResponseEntity.ok(permissionService.getPermissionGroupById(id));
    }
    
    @PostMapping("/groups")
    @Operation(summary = "Tạo nhóm quyền mới")
    @HasPermission("permission_group:create")
    public ResponseEntity<PermissionGroupResponse> createPermissionGroup(@Valid @RequestBody PermissionGroupRequest request) {
        log.info("POST /api/v1/permissions/groups: Tạo nhóm quyền mới: {}", request.getName());
        return new ResponseEntity<>(permissionService.createPermissionGroup(request), HttpStatus.CREATED);
    }
    
    @PutMapping("/groups/{id}")
    @Operation(summary = "Cập nhật thông tin nhóm quyền")
    @HasPermission("permission_group:update")
    public ResponseEntity<PermissionGroupResponse> updatePermissionGroup(
            @PathVariable UUID id,
            @Valid @RequestBody PermissionGroupRequest request) {
        log.info("PUT /api/v1/permissions/groups/{}: Cập nhật thông tin nhóm quyền", id);
        return ResponseEntity.ok(permissionService.updatePermissionGroup(id, request));
    }
    
    @DeleteMapping("/groups/{id}")
    @Operation(summary = "Xóa nhóm quyền")
    @HasPermission("permission_group:delete")
    public ResponseEntity<Void> deletePermissionGroup(@PathVariable UUID id) {
        log.info("DELETE /api/v1/permissions/groups/{}: Xóa nhóm quyền", id);
        permissionService.deletePermissionGroup(id);
        return ResponseEntity.noContent().build();
    }
    
    // ============ Quản lý quyền trong nhóm quyền ============
    
    @PostMapping("/groups/{groupId}/permissions/{permissionId}")
    @Operation(summary = "Thêm quyền vào nhóm quyền")
    @HasPermission("permission_group:update")
    public ResponseEntity<PermissionGroupResponse> addPermissionToGroup(
            @PathVariable UUID groupId,
            @PathVariable UUID permissionId) {
        log.info("POST /api/v1/permissions/groups/{}/permissions/{}: Thêm quyền vào nhóm quyền", groupId, permissionId);
        return ResponseEntity.ok(permissionService.addPermissionToGroup(groupId, permissionId));
    }
    
    @DeleteMapping("/groups/{groupId}/permissions/{permissionId}")
    @Operation(summary = "Xóa quyền khỏi nhóm quyền")
    @HasPermission("permission_group:update")
    public ResponseEntity<PermissionGroupResponse> removePermissionFromGroup(
            @PathVariable UUID groupId,
            @PathVariable UUID permissionId) {
        log.info("DELETE /api/v1/permissions/groups/{}/permissions/{}: Xóa quyền khỏi nhóm quyền", groupId, permissionId);
        return ResponseEntity.ok(permissionService.removePermissionFromGroup(groupId, permissionId));
    }
    
    // ============ Quản lý nhóm quyền của người dùng ============
    
    @GetMapping("/users/{userId}/groups")
    @Operation(summary = "Lấy danh sách nhóm quyền của một người dùng")
    @HasPermission("user_permission:view")
    public ResponseEntity<List<UUID>> getUserPermissionGroups(@PathVariable UUID userId) {
        List<UUID> permissionGroups = permissionService.getUserPermissionGroups(userId);
        return ResponseEntity.ok(permissionGroups);
    }
    
    @GetMapping("/users/all-permissions")
    @Operation(summary = "Lấy danh sách nhóm quyền của tất cả người dùng")
    @HasPermission("user_permission:view")
    public ResponseEntity<Map<UUID, List<UUID>>> getAllUserPermissionGroups() {
        Map<UUID, List<UUID>> permissionGroups = permissionService.getAllUserPermissionGroups();
        return ResponseEntity.ok(permissionGroups);
    }
    
    @PostMapping("/users/{userId}/groups/{groupId}")
    @Operation(summary = "Gán nhóm quyền cho người dùng")
    @HasPermission("user_permission:update")
    public ResponseEntity<Map<String, Object>> assignPermissionGroupToUser(
            @PathVariable UUID userId,
            @PathVariable UUID groupId) {
        log.info("POST /api/v1/permissions/users/{}/groups/{}: Gán nhóm quyền cho người dùng", userId, groupId);
        
        // Gán nhóm quyền cho người dùng
        permissionService.assignPermissionGroupToUser(userId, groupId);
        
        // Làm mới token để áp dụng quyền mới
        try {
            authService.forceRefreshToken(userId);
            log.info("Đã làm mới token cho người dùng {}", userId);
        } catch (Exception e) {
            log.error("Không thể làm mới token cho người dùng {}: {}", userId, e.getMessage());
        }
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Đã gán nhóm quyền cho người dùng và làm mới token"
        ));
    }
    
    @DeleteMapping("/users/{userId}/groups/{groupId}")
    @Operation(summary = "Gỡ bỏ nhóm quyền khỏi người dùng")
    @HasPermission("user_permission:update")
    public ResponseEntity<Map<String, Object>> removePermissionGroupFromUser(
            @PathVariable UUID userId,
            @PathVariable UUID groupId) {
        log.info("DELETE /api/v1/permissions/users/{}/groups/{}: Gỡ bỏ nhóm quyền khỏi người dùng", userId, groupId);
        
        // Gỡ bỏ nhóm quyền khỏi người dùng
        permissionService.removePermissionGroupFromUser(userId, groupId);
        
        // Làm mới token để áp dụng quyền mới
        try {
            authService.forceRefreshToken(userId);
            log.info("Đã làm mới token cho người dùng {}", userId);
        } catch (Exception e) {
            log.error("Không thể làm mới token cho người dùng {}: {}", userId, e.getMessage());
        }
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Đã gỡ bỏ nhóm quyền khỏi người dùng và làm mới token"
        ));
    }
    
    @GetMapping("/user/{username}/permissions")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getUserPermissions(@PathVariable String username) {
        log.debug("Getting permissions for user: {}", username);
        Map<String, Object> permissionInfo = permissionService.getUserPermissionInfo(username);
        return ResponseEntity.ok(permissionInfo);
    }
} 