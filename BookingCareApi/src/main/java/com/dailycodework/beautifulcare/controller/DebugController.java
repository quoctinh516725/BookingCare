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
    
    @GetMapping("/database-mappings")
    @Operation(summary = "Inspect database mappings for permission related tables")
    public ResponseEntity<Map<String, Object>> inspectDatabaseMappings() {
        log.info("Kiểm tra mapping database cho các bảng liên quan đến quyền");
        
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Lấy tất cả nhóm quyền
            List<PermissionGroup> allGroups = permissionGroupRepository.findAll();
            
            // Lấy tổng số user và permission
            long userCount = userRepository.count();
            long permissionCount = permissionRepository.count();
            
            // Thông tin cơ bản
            Map<String, Object> overview = new HashMap<>();
            overview.put("numberOfPermissionGroups", allGroups.size());
            overview.put("numberOfUsers", userCount);
            overview.put("numberOfPermissions", permissionCount);
            result.put("overview", overview);
            
            // Thống kê chi tiết về các nhóm quyền
            List<Map<String, Object>> groupStats = new ArrayList<>();
            for (PermissionGroup group : allGroups) {
                Map<String, Object> groupInfo = new HashMap<>();
                groupInfo.put("id", group.getId());
                groupInfo.put("name", group.getName());
                groupInfo.put("userCount", group.getUsers().size());
                groupInfo.put("permissionCount", group.getPermissions().size());
                groupStats.add(groupInfo);
            }
            result.put("permissionGroupStats", groupStats);
            
            // Thống kê top user theo số lượng nhóm quyền
            List<User> allUsers = userRepository.findAll();
            allUsers.sort((u1, u2) -> u2.getPermissionGroups().size() - u1.getPermissionGroups().size());
            
            List<Map<String, Object>> topUsers = new ArrayList<>();
            for (int i = 0; i < Math.min(10, allUsers.size()); i++) {
                User user = allUsers.get(i);
                Map<String, Object> userInfo = new HashMap<>();
                userInfo.put("id", user.getId());
                userInfo.put("username", user.getUsername());
                userInfo.put("groupCount", user.getPermissionGroups().size());
                
                // Danh sách tên các nhóm
                List<String> groupNames = new ArrayList<>();
                for (PermissionGroup group : user.getPermissionGroups()) {
                    groupNames.add(group.getName());
                }
                userInfo.put("groups", groupNames);
                
                topUsers.add(userInfo);
            }
            result.put("topUsersByGroupCount", topUsers);
            
            // Kiểm tra mapping trong database
            result.put("success", true);
            result.put("message", "Mapping được kiểm tra thành công");
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Lỗi khi kiểm tra database mapping: {}", e.getMessage());
            
            result.put("success", false);
            result.put("message", "Lỗi khi kiểm tra database mapping: " + e.getMessage());
            return ResponseEntity.status(500).body(result);
        }
    }
    
    @GetMapping("/user-permission-groups")
    @Operation(summary = "Inspect the user_permission_groups join table")
    public ResponseEntity<Map<String, Object>> inspectUserPermissionGroups() {
        log.info("Kiểm tra bảng user_permission_groups");
        
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Lấy thông tin người dùng và nhóm quyền
            List<User> allUsers = userRepository.findAll();
            List<PermissionGroup> allGroups = permissionGroupRepository.findAll();
            
            // Tạo mapping id -> tên user để dễ dàng tham chiếu
            Map<UUID, String> userIdToName = new HashMap<>();
            for (User user : allUsers) {
                userIdToName.put(user.getId(), user.getUsername());
            }
            
            // Tạo mapping id -> tên group để dễ dàng tham chiếu
            Map<UUID, String> groupIdToName = new HashMap<>();
            for (PermissionGroup group : allGroups) {
                groupIdToName.put(group.getId(), group.getName());
            }
            
            // Thông tin quan hệ user-group từ phía user
            List<Map<String, Object>> userToGroups = new ArrayList<>();
            for (User user : allUsers) {
                if (user.getPermissionGroups().isEmpty()) {
                    continue; // Bỏ qua user không có nhóm quyền
                }
                
                Map<String, Object> relationship = new HashMap<>();
                relationship.put("userId", user.getId());
                relationship.put("username", user.getUsername());
                
                List<Map<String, Object>> groups = new ArrayList<>();
                for (PermissionGroup group : user.getPermissionGroups()) {
                    Map<String, Object> groupInfo = new HashMap<>();
                    groupInfo.put("groupId", group.getId());
                    groupInfo.put("groupName", group.getName());
                    groups.add(groupInfo);
                }
                relationship.put("groups", groups);
                relationship.put("groupCount", groups.size());
                
                userToGroups.add(relationship);
            }
            result.put("userToGroups", userToGroups);
            
            // Thông tin quan hệ group-user từ phía group
            List<Map<String, Object>> groupToUsers = new ArrayList<>();
            for (PermissionGroup group : allGroups) {
                if (group.getUsers().isEmpty()) {
                    continue; // Bỏ qua group không có user
                }
                
                Map<String, Object> relationship = new HashMap<>();
                relationship.put("groupId", group.getId());
                relationship.put("groupName", group.getName());
                
                List<Map<String, Object>> users = new ArrayList<>();
                for (User user : group.getUsers()) {
                    Map<String, Object> userInfo = new HashMap<>();
                    userInfo.put("userId", user.getId());
                    userInfo.put("username", user.getUsername());
                    users.add(userInfo);
                }
                relationship.put("users", users);
                relationship.put("userCount", users.size());
                
                groupToUsers.add(relationship);
            }
            result.put("groupToUsers", groupToUsers);
            
            // Thống kê tổng hợp
            result.put("totalUserGroupMappings", userToGroups.stream().mapToInt(m -> (Integer)m.get("groupCount")).sum());
            result.put("usersWithGroups", userToGroups.size());
            result.put("groupsWithUsers", groupToUsers.size());
            
            result.put("success", true);
            result.put("message", "Kiểm tra user_permission_groups thành công");
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Lỗi khi kiểm tra user_permission_groups: {}", e.getMessage());
            log.error("Chi tiết lỗi:", e);
            
            result.put("success", false);
            result.put("message", "Lỗi khi kiểm tra user_permission_groups: " + e.getMessage());
            result.put("stackTrace", e.getStackTrace());
            return ResponseEntity.status(500).body(result);
        }
    }

    // Thêm endpoint mới để kiểm tra sự tồn tại của cột trong bảng
    @GetMapping("/check-table-structure")
    @Operation(summary = "Check the structure of permission-related tables")
    public ResponseEntity<Map<String, Object>> checkTableStructure() {
        log.info("Kiểm tra cấu trúc các bảng liên quan đến quyền");
        
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Kiểm tra mapping Java
            Map<String, Object> javaMapping = new HashMap<>();
            
            // Kiểm tra User entity - mối quan hệ với PermissionGroup
            Map<String, Object> userEntityInfo = new HashMap<>();
            User sampleUser = userRepository.findAll().stream().findFirst().orElse(null);
            userEntityInfo.put("userClass", User.class.getName());
            userEntityInfo.put("userPermissionGroupsField", "Set<PermissionGroup> permissionGroups");
            userEntityInfo.put("joinTableAnnotation", "@JoinTable(name = \"user_permission_groups\")");
            userEntityInfo.put("joinColumnAnnotation", "@JoinColumn(name = \"user_id\")");
            userEntityInfo.put("inverseJoinColumnAnnotation", "@JoinColumn(name = \"permission_group_id\")");
            
            if (sampleUser != null) {
                userEntityInfo.put("sampleUserHasPermissionGroups", !sampleUser.getPermissionGroups().isEmpty());
                userEntityInfo.put("mapperAccessible", true);
            } else {
                userEntityInfo.put("sampleUserHasPermissionGroups", "No users found");
                userEntityInfo.put("mapperAccessible", false);
            }
            
            javaMapping.put("userEntity", userEntityInfo);
            
            // Kiểm tra PermissionGroup entity
            Map<String, Object> groupEntityInfo = new HashMap<>();
            PermissionGroup sampleGroup = permissionGroupRepository.findAll().stream().findFirst().orElse(null);
            groupEntityInfo.put("permissionGroupClass", PermissionGroup.class.getName());
            groupEntityInfo.put("usersField", "Set<User> users");
            groupEntityInfo.put("mappedByAnnotation", "@ManyToMany(mappedBy = \"permissionGroups\")");
            
            if (sampleGroup != null) {
                groupEntityInfo.put("sampleGroupHasUsers", !sampleGroup.getUsers().isEmpty());
                groupEntityInfo.put("mapperAccessible", true);
            } else {
                groupEntityInfo.put("sampleGroupHasUsers", "No groups found");
                groupEntityInfo.put("mapperAccessible", false);
            }
            
            javaMapping.put("permissionGroupEntity", groupEntityInfo);
            
            // Thêm thông tin mapping vào kết quả
            result.put("javaMapping", javaMapping);
            
            // Thêm thông tin trạng thái
            result.put("success", true);
            result.put("message", "Kiểm tra cấu trúc bảng thành công");
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Lỗi khi kiểm tra cấu trúc bảng: {}", e.getMessage());
            log.error("Chi tiết lỗi:", e);
            
            result.put("success", false);
            result.put("message", "Lỗi khi kiểm tra cấu trúc bảng: " + e.getMessage());
            return ResponseEntity.status(500).body(result);
        }
    }
} 