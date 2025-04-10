package com.dailycodework.beautifulcare.controller;

import com.dailycodework.beautifulcare.config.DirectDatabaseFixer;
import com.dailycodework.beautifulcare.config.UserPermissionGroupsFixer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller để thực hiện các thao tác sửa chữa và chẩn đoán database
 * CHỈ CHO ADMIN sử dụng
 */
@RestController
@RequestMapping("/api/v1/admin/database")
@PreAuthorize("hasRole('ADMIN')")
public class DatabaseFixerController {
    private static final Logger log = LoggerFactory.getLogger(DatabaseFixerController.class);
    
    private final DirectDatabaseFixer directDatabaseFixer;
    private final UserPermissionGroupsFixer userPermissionGroupsFixer;
    private final JdbcTemplate jdbcTemplate;
    
    @Autowired
    public DatabaseFixerController(
        DirectDatabaseFixer directDatabaseFixer,
        UserPermissionGroupsFixer userPermissionGroupsFixer,
        JdbcTemplate jdbcTemplate) {
        this.directDatabaseFixer = directDatabaseFixer;
        this.userPermissionGroupsFixer = userPermissionGroupsFixer;
        this.jdbcTemplate = jdbcTemplate;
    }
    
    /**
     * Chẩn đoán tình trạng các bảng join
     */
    @GetMapping("/diagnose")
    public ResponseEntity<?> diagnoseTables() {
        log.info("Bắt đầu chẩn đoán database theo yêu cầu của admin");
        
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> issues = new ArrayList<>();
        
        try {
            // Kiểm tra bảng permission_group_permissions
            Boolean hasPermissionGroupPermissionsTable = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) > 0 FROM information_schema.tables " +
                "WHERE table_schema = DATABASE() AND table_name = 'permission_group_permissions'", 
                Boolean.class);
                
            if (hasPermissionGroupPermissionsTable != null && hasPermissionGroupPermissionsTable) {
                // Kiểm tra cấu trúc cột
                List<Map<String, Object>> pgpColumns = jdbcTemplate.queryForList(
                    "SELECT column_name FROM information_schema.columns " +
                    "WHERE table_schema = DATABASE() " +
                    "AND table_name = 'permission_group_permissions'"
                );
                
                Map<String, Object> pgpInfo = new HashMap<>();
                pgpInfo.put("table", "permission_group_permissions");
                pgpInfo.put("exists", true);
                pgpInfo.put("columns", pgpColumns);
                
                // Kiểm tra sự tồn tại của cột permission_group_id
                Boolean hasPermissionGroupId = pgpColumns.stream()
                    .anyMatch(col -> "permission_group_id".equals(col.get("column_name")));
                    
                if (!hasPermissionGroupId) {
                    Map<String, Object> issue = new HashMap<>();
                    issue.put("table", "permission_group_permissions");
                    issue.put("severity", "HIGH");
                    issue.put("description", "Cột permission_group_id không tồn tại");
                    issue.put("solution", "Chạy API sửa chữa");
                    issues.add(issue);
                }
                
                result.put("permission_group_permissions", pgpInfo);
            } else {
                Map<String, Object> pgpInfo = new HashMap<>();
                pgpInfo.put("table", "permission_group_permissions");
                pgpInfo.put("exists", false);
                
                Map<String, Object> issue = new HashMap<>();
                issue.put("table", "permission_group_permissions");
                issue.put("severity", "CRITICAL");
                issue.put("description", "Bảng permission_group_permissions không tồn tại");
                issue.put("solution", "Chạy API sửa chữa");
                issues.add(issue);
                
                result.put("permission_group_permissions", pgpInfo);
            }
            
            // Kiểm tra bảng user_permission_groups
            Boolean hasUserPermissionGroupsTable = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) > 0 FROM information_schema.tables " +
                "WHERE table_schema = DATABASE() AND table_name = 'user_permission_groups'", 
                Boolean.class);
                
            if (hasUserPermissionGroupsTable != null && hasUserPermissionGroupsTable) {
                // Kiểm tra cấu trúc cột
                List<Map<String, Object>> upgColumns = jdbcTemplate.queryForList(
                    "SELECT column_name FROM information_schema.columns " +
                    "WHERE table_schema = DATABASE() " +
                    "AND table_name = 'user_permission_groups'"
                );
                
                Map<String, Object> upgInfo = new HashMap<>();
                upgInfo.put("table", "user_permission_groups");
                upgInfo.put("exists", true);
                upgInfo.put("columns", upgColumns);
                
                // Kiểm tra sự tồn tại của cột permission_group_id
                Boolean hasPermissionGroupId = upgColumns.stream()
                    .anyMatch(col -> "permission_group_id".equals(col.get("column_name")));
                    
                if (!hasPermissionGroupId) {
                    Map<String, Object> issue = new HashMap<>();
                    issue.put("table", "user_permission_groups");
                    issue.put("severity", "HIGH");
                    issue.put("description", "Cột permission_group_id không tồn tại");
                    issue.put("solution", "Chạy API sửa chữa");
                    issues.add(issue);
                }
                
                // Kiểm tra sự tồn tại của cột group_id (nên thay thế bằng permission_group_id)
                Boolean hasGroupId = upgColumns.stream()
                    .anyMatch(col -> "group_id".equals(col.get("column_name")));
                    
                if (hasGroupId) {
                    Map<String, Object> issue = new HashMap<>();
                    issue.put("table", "user_permission_groups");
                    issue.put("severity", "MEDIUM");
                    issue.put("description", "Cột group_id tồn tại (nên được thay thế bằng permission_group_id)");
                    issue.put("solution", "Chạy API sửa chữa");
                    issues.add(issue);
                }
                
                result.put("user_permission_groups", upgInfo);
            } else {
                Map<String, Object> upgInfo = new HashMap<>();
                upgInfo.put("table", "user_permission_groups");
                upgInfo.put("exists", false);
                
                Map<String, Object> issue = new HashMap<>();
                issue.put("table", "user_permission_groups");
                issue.put("severity", "CRITICAL");
                issue.put("description", "Bảng user_permission_groups không tồn tại");
                issue.put("solution", "Chạy API sửa chữa");
                issues.add(issue);
                
                result.put("user_permission_groups", upgInfo);
            }
            
            result.put("issues", issues);
            result.put("issueCount", issues.size());
            result.put("success", true);
            result.put("message", "Chẩn đoán hoàn tất");
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Lỗi khi chẩn đoán database: {}", e.getMessage());
            
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Lỗi khi chẩn đoán database: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    /**
     * Sửa chữa bảng permission_group_permissions
     */
    @PostMapping("/fix/permission-group-permissions")
    public ResponseEntity<?> fixPermissionGroupPermissions() {
        log.info("Bắt đầu sửa chữa bảng permission_group_permissions theo yêu cầu của admin");
        
        try {
            directDatabaseFixer.fixDatabase();
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Đã sửa chữa bảng permission_group_permissions thành công");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Lỗi khi sửa chữa bảng permission_group_permissions: {}", e.getMessage());
            
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Lỗi khi sửa chữa: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    /**
     * Sửa chữa bảng user_permission_groups
     */
    @PostMapping("/fix/user-permission-groups")
    public ResponseEntity<?> fixUserPermissionGroups() {
        log.info("Bắt đầu sửa chữa bảng user_permission_groups theo yêu cầu của admin");
        
        try {
            userPermissionGroupsFixer.fixUserPermissionGroupsTable();
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Đã sửa chữa bảng user_permission_groups thành công");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Lỗi khi sửa chữa bảng user_permission_groups: {}", e.getMessage());
            
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Lỗi khi sửa chữa: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
    
    /**
     * Sửa chữa tất cả các bảng
     */
    @PostMapping("/fix/all")
    public ResponseEntity<?> fixAllTables() {
        log.info("Bắt đầu sửa chữa tất cả các bảng theo yêu cầu của admin");
        
        try {
            directDatabaseFixer.fixDatabase();
            userPermissionGroupsFixer.fixUserPermissionGroupsTable();
            
            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("message", "Đã sửa chữa tất cả các bảng thành công");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Lỗi khi sửa chữa các bảng: {}", e.getMessage());
            
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Lỗi khi sửa chữa: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
} 