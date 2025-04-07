package com.dailycodework.beautifulcare.controller;

import com.dailycodework.beautifulcare.entity.Permission;
import com.dailycodework.beautifulcare.entity.PermissionGroup;
import com.dailycodework.beautifulcare.entity.User;
import com.dailycodework.beautifulcare.exception.ResourceNotFoundException;
import com.dailycodework.beautifulcare.repository.PermissionGroupRepository;
import com.dailycodework.beautifulcare.repository.PermissionRepository;
import com.dailycodework.beautifulcare.repository.UserRepository;
import com.dailycodework.beautifulcare.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Controller để debug các vấn đề phân quyền, chỉ dành cho admin
 */
@RestController
@RequestMapping("/api/v1/debug")
@RequiredArgsConstructor
@Tag(name = "Debug", description = "Debug APIs for troubleshooting permissions")
@PreAuthorize("hasRole('ADMIN')")
@Slf4j
public class DebugController {
    
    private final UserRepository userRepository;
    private final PermissionGroupRepository permissionGroupRepository;
    private final PermissionRepository permissionRepository;
    private final SecurityUtils securityUtils;
    
    @GetMapping("/current-user")
    @Operation(summary = "Get details about the current authenticated user")
    public ResponseEntity<Map<String, Object>> getCurrentUserDetails() {
        User currentUser = securityUtils.getCurrentUser();
        
        Map<String, Object> result = new HashMap<>();
        result.put("userId", currentUser.getId());
        result.put("username", currentUser.getUsername());
        result.put("email", currentUser.getEmail());
        result.put("role", currentUser.getRole().name());
        
        // Thêm thông tin về quyền
        List<String> authorities = new ArrayList<>();
        currentUser.getAuthorities().forEach(auth -> authorities.add(auth.getAuthority()));
        result.put("authorities", authorities);
        
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/user-permissions/{userId}")
    @Operation(summary = "Get detailed permissions info for a specific user")
    public ResponseEntity<Map<String, Object>> getUserPermissions(@PathVariable UUID userId) {
        log.info("Fetching detailed permission info for user ID: {}", userId);
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Map<String, Object> result = new HashMap<>();
        result.put("userId", user.getId());
        result.put("username", user.getUsername());
        result.put("email", user.getEmail());
        result.put("role", user.getRole().name());
        
        // Lấy danh sách các authorities từ user
        List<String> authorities = new ArrayList<>();
        user.getAuthorities().forEach(auth -> authorities.add(auth.getAuthority()));
        result.put("authorities", authorities);
        
        // Thông tin chi tiết về các nhóm quyền
        List<Map<String, Object>> groups = new ArrayList<>();
        for (PermissionGroup group : user.getPermissionGroups()) {
            Map<String, Object> groupInfo = new HashMap<>();
            groupInfo.put("groupId", group.getId());
            groupInfo.put("groupName", group.getName());
            groupInfo.put("description", group.getDescription());
            
            List<Map<String, String>> permissions = new ArrayList<>();
            for (Permission permission : group.getPermissions()) {
                Map<String, String> permInfo = new HashMap<>();
                permInfo.put("id", permission.getId().toString());
                permInfo.put("name", permission.getName());
                permInfo.put("code", permission.getCode());
                permInfo.put("description", permission.getDescription());
                permissions.add(permInfo);
            }
            
            groupInfo.put("permissions", permissions);
            groups.add(groupInfo);
        }
        
        result.put("permissionGroups", groups);
        result.put("permissionsUpdatedAt", user.getPermissionsUpdatedAt());
        
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/check-permission")
    @Operation(summary = "Check if a user has a specific permission")
    public ResponseEntity<Map<String, Object>> checkPermission(
            @RequestParam UUID userId, 
            @RequestParam String permissionCode) {
        
        log.info("Checking if user {} has permission: {}", userId, permissionCode);
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        boolean hasPermission = user.hasPermission(permissionCode);
        
        Map<String, Object> result = new HashMap<>();
        result.put("userId", user.getId());
        result.put("username", user.getUsername());
        result.put("permissionCode", permissionCode);
        result.put("hasPermission", hasPermission);
        
        // Thêm thông tin về role để debug
        result.put("role", user.getRole().name());
        result.put("isAdmin", user.getRole().name().equals("ADMIN"));
        
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/check-permission-group")
    @Operation(summary = "Check if a user belongs to a specific permission group")
    public ResponseEntity<Map<String, Object>> checkPermissionGroup(
            @RequestParam UUID userId, 
            @RequestParam String groupName) {
        
        log.info("Checking if user {} belongs to group: {}", userId, groupName);
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        boolean hasGroup = user.hasPermissionGroup(groupName);
        
        Map<String, Object> result = new HashMap<>();
        result.put("userId", user.getId());
        result.put("username", user.getUsername());
        result.put("groupName", groupName);
        result.put("hasGroup", hasGroup);
        
        // Thêm thông tin về các group hiện có của user
        List<String> userGroups = new ArrayList<>();
        for (PermissionGroup group : user.getPermissionGroups()) {
            userGroups.add(group.getName());
        }
        result.put("userGroups", userGroups);
        
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/check-create-user-permission")
    @Operation(summary = "Check user creation permission for a user")
    public ResponseEntity<Map<String, Object>> checkCreateUserPermission(@RequestParam UUID userId) {
        log.info("Checking user creation permission for user ID: {}", userId);
        
        User user = userRepository.findByIdWithPermissions(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        Map<String, Object> result = new HashMap<>();
        result.put("userId", user.getId());
        result.put("username", user.getUsername());
        result.put("email", user.getEmail());
        result.put("role", user.getRole().name());
        
        // Kiểm tra quyền tạo người dùng theo nhiều cách để so sánh kết quả
        boolean hasCreateUserPermissionDirect = user.hasPermission("user:create");
        
        // Kiểm tra từng nhóm quyền
        Map<String, Boolean> groupResults = new HashMap<>();
        for (PermissionGroup group : user.getPermissionGroups()) {
            boolean groupHasPermission = false;
            for (Permission permission : group.getPermissions()) {
                if ("user:create".equals(permission.getCode())) {
                    groupHasPermission = true;
                    break;
                }
            }
            groupResults.put(group.getName(), groupHasPermission);
        }
        
        // Tìm kiếm quyền này trong cơ sở dữ liệu
        Optional<Permission> createUserPermissionOpt = permissionRepository.findByCode("user:create");
        boolean permissionExists = createUserPermissionOpt.isPresent();
        
        // Thu thập tất cả kết quả
        result.put("hasCreateUserPermission", hasCreateUserPermissionDirect);
        result.put("permissionGroupResults", groupResults);
        result.put("isAdmin", user.getRole().name().equals("ADMIN"));
        result.put("createUserPermissionExists", permissionExists);
        
        if (permissionExists) {
            Permission perm = createUserPermissionOpt.get();
            Map<String, Object> details = new HashMap<>();
            details.put("id", perm.getId());
            details.put("name", perm.getName());
            details.put("code", perm.getCode());
            details.put("description", perm.getDescription());
            
            // Lấy các nhóm quyền chứa quyền này
            List<String> groupNames = new ArrayList<>();
            for (PermissionGroup group : perm.getGroups()) {
                groupNames.add(group.getName());
            }
            details.put("groups", groupNames);
            
            result.put("createUserPermissionDetails", details);
        }
        
        // Đề xuất hành động
        List<String> suggestions = new ArrayList<>();
        if (!hasCreateUserPermissionDirect && !user.getRole().name().equals("ADMIN")) {
            suggestions.add("User needs to be assigned a permission group containing 'user:create' permission");
            if (!permissionExists) {
                suggestions.add("Permission 'user:create' does not exist in the database and needs to be created");
            } else {
                // Tìm nhóm quyền chứa quyền này để gợi ý
                List<String> suggestedGroups = new ArrayList<>();
                Permission perm = createUserPermissionOpt.get();
                for (PermissionGroup group : perm.getGroups()) {
                    suggestedGroups.add(group.getName());
                }
                
                if (!suggestedGroups.isEmpty()) {
                    suggestions.add("Consider assigning user to one of these permission groups: " + String.join(", ", suggestedGroups));
                }
            }
        } else if (user.getRole().name().equals("ADMIN")) {
            suggestions.add("User already has all permissions as an ADMIN");
        } else {
            suggestions.add("User already has 'user:create' permission");
            suggestions.add("Ensure the user logs out and logs back in to refresh their token and permissions");
        }
        
        result.put("suggestions", suggestions);
        
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/performance-test")
    @Operation(summary = "Test eager loading vs lazy loading performance")
    @Transactional(readOnly = true)
    public ResponseEntity<Map<String, Object>> testPerformance() {
        Map<String, Object> result = new HashMap<>();
        
        // Test 1: Lazy loading (default findAll)
        long startTime = System.currentTimeMillis();
        List<User> usersLazy = userRepository.findAll();
        int lazyPermissionCount = 0;
        for (User user : usersLazy) {
            lazyPermissionCount += user.getPermissionGroups().size();
        }
        long lazyTime = System.currentTimeMillis() - startTime;
        
        // Test 2: Eager loading (optimized query)
        startTime = System.currentTimeMillis();
        List<User> usersEager = userRepository.findAllWithPermissionGroups();
        int eagerPermissionCount = 0;
        for (User user : usersEager) {
            eagerPermissionCount += user.getPermissionGroups().size();
        }
        long eagerTime = System.currentTimeMillis() - startTime;
        
        // Collect results
        result.put("userCount", usersLazy.size());
        result.put("totalPermissionGroups", lazyPermissionCount);
        
        Map<String, Object> lazyResults = new HashMap<>();
        lazyResults.put("executionTimeMs", lazyTime);
        lazyResults.put("method", "findAll (lazy loading)");
        
        Map<String, Object> eagerResults = new HashMap<>();
        eagerResults.put("executionTimeMs", eagerTime);
        eagerResults.put("method", "findAllWithPermissionGroups (eager loading)");
        eagerResults.put("speedupPercent", lazyTime > 0 ? ((lazyTime - eagerTime) * 100.0 / lazyTime) : 0);
        
        result.put("lazyLoading", lazyResults);
        result.put("eagerLoading", eagerResults);
        
        // Recommendations
        List<String> recommendations = new ArrayList<>();
        if (eagerTime < lazyTime) {
            recommendations.add("Eager loading is more efficient for this data set.");
            recommendations.add("Keep using the optimized repository methods.");
        } else {
            recommendations.add("Lazy loading is performing better for this data set.");
            recommendations.add("Consider reverting to regular findAll() method.");
        }
        
        if (lazyPermissionCount > 50 && usersLazy.size() > 10) {
            recommendations.add("Consider pagination for large result sets.");
        }
        
        result.put("recommendations", recommendations);
        
        return ResponseEntity.ok(result);
    }
} 