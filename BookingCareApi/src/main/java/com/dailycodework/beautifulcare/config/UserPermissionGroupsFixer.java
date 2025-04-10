package com.dailycodework.beautifulcare.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

/**
 * Công cụ sửa bảng user_permission_groups để đảm bảo cấu trúc bảng phù hợp với entity mapping.
 * Class này sẽ thực hiện sau khi DirectDatabaseFixer đã hoàn thành.
 */
@Component
public class UserPermissionGroupsFixer {
    private static final Logger log = LoggerFactory.getLogger(UserPermissionGroupsFixer.class);
    
    private final JdbcTemplate jdbcTemplate;
    
    @Autowired
    public UserPermissionGroupsFixer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }
    
    /**
     * Thực hiện sau khi ứng dụng đã khởi động hoàn tất
     * Order = 2 để đảm bảo chạy sau DirectDatabaseFixer (mặc định là 0)
     */
    @EventListener(value = ApplicationReadyEvent.class, condition = "true")
    @Order(2) // Thực hiện sau DirectDatabaseFixer
    @Transactional
    public void fixUserPermissionGroupsTable() {
        log.info("=== BẮT ĐẦU KIỂM TRA VÀ SỬA BẢNG USER_PERMISSION_GROUPS ===");
        
        try {
            // Chẩn đoán cấu trúc bảng hiện tại
            diagnoseTable();
            
            // Tạo lại bảng với cấu trúc đúng
            recreateTable();
            
            // Xác nhận cấu trúc bảng sau khi sửa
            verifyTableStructure();
            
            log.info("=== HOÀN THÀNH SỬA CHỮA BẢNG USER_PERMISSION_GROUPS ===");
        } catch (Exception e) {
            log.error("LỖI NGHIÊM TRỌNG: Không thể sửa bảng user_permission_groups: {}", e.getMessage());
            log.debug("Chi tiết lỗi:", e);
        }
    }
    
    /**
     * In thông tin chẩn đoán về cấu trúc bảng
     */
    private void diagnoseTable() {
        try {
            log.info("Chẩn đoán cấu trúc bảng user_permission_groups...");
            
            // Kiểm tra xem bảng có tồn tại không
            Boolean tableExists = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) > 0 FROM information_schema.tables " +
                "WHERE table_schema = DATABASE() AND table_name = 'user_permission_groups'", 
                Boolean.class);
                
            if (tableExists != null && tableExists) {
                log.info("✓ Bảng user_permission_groups tồn tại");
                
                // Lấy thông tin cột
                List<Map<String, Object>> columns = jdbcTemplate.queryForList(
                    "SELECT column_name, column_type, is_nullable " +
                    "FROM information_schema.columns " +
                    "WHERE table_schema = DATABASE() " +
                    "AND table_name = 'user_permission_groups'"
                );
                
                log.info("Các cột trong bảng:");
                for (Map<String, Object> column : columns) {
                    log.info("  - Cột: {}, Kiểu: {}, Nullable: {}", 
                            column.get("column_name"), 
                            column.get("column_type"),
                            column.get("is_nullable"));
                }
                
                // Kiểm tra xem có cột group_id không
                Boolean hasGroupId = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) > 0 FROM information_schema.columns " +
                    "WHERE table_schema = DATABASE() " +
                    "AND table_name = 'user_permission_groups' " +
                    "AND column_name = 'group_id'", 
                    Boolean.class);
                
                // Kiểm tra xem có cột permission_group_id không
                Boolean hasPermissionGroupId = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) > 0 FROM information_schema.columns " +
                    "WHERE table_schema = DATABASE() " +
                    "AND table_name = 'user_permission_groups' " +
                    "AND column_name = 'permission_group_id'", 
                    Boolean.class);
                    
                if (hasGroupId != null && hasGroupId) {
                    log.info("❌ Phát hiện cột 'group_id' - cần sửa thành 'permission_group_id'");
                }
                
                if (hasPermissionGroupId != null && hasPermissionGroupId) {
                    log.info("✓ Cột 'permission_group_id' đã tồn tại");
                } else {
                    log.info("❌ Không tìm thấy cột 'permission_group_id' - cần tạo mới");
                }
                
                // Kiểm tra khóa ngoại
                List<Map<String, Object>> foreignKeys = jdbcTemplate.queryForList(
                    "SELECT kcu.column_name, kcu.referenced_table_name, kcu.referenced_column_name " +
                    "FROM information_schema.table_constraints tc " +
                    "JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name " +
                    "WHERE tc.constraint_type = 'FOREIGN KEY' " +
                    "AND tc.table_schema = DATABASE() " +
                    "AND tc.table_name = 'user_permission_groups'"
                );
                
                log.info("Các khóa ngoại trong bảng:");
                for (Map<String, Object> fk : foreignKeys) {
                    log.info("  - Cột: {}, Tham chiếu đến: {}.{}", 
                            fk.get("column_name"), 
                            fk.get("referenced_table_name"),
                            fk.get("referenced_column_name"));
                }
                
                // Đếm số dòng dữ liệu
                Integer rowCount = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM user_permission_groups", 
                    Integer.class);
                    
                log.info("Bảng chứa {} dòng dữ liệu", rowCount != null ? rowCount : 0);
            } else {
                log.info("❌ Bảng user_permission_groups không tồn tại - cần tạo mới");
            }
        } catch (Exception e) {
            log.warn("Lỗi khi chẩn đoán: {}", e.getMessage());
            // Tiếp tục sửa chữa ngay cả khi chẩn đoán thất bại
        }
    }
    
    /**
     * Tạo lại bảng với cấu trúc đúng
     */
    private void recreateTable() {
        try {
            log.info("Tạo bảng backup và lưu dữ liệu hiện tại...");
            
            // Kiểm tra xem bảng có tồn tại không
            Boolean tableExists = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) > 0 FROM information_schema.tables " +
                "WHERE table_schema = DATABASE() AND table_name = 'user_permission_groups'", 
                Boolean.class);
                
            if (tableExists != null && tableExists) {
                // Tạo bảng backup trước
                jdbcTemplate.execute(
                    "CREATE TABLE IF NOT EXISTS user_permission_groups_backup LIKE user_permission_groups"
                );
                
                // Chèn dữ liệu vào backup
                try {
                    jdbcTemplate.update(
                        "INSERT IGNORE INTO user_permission_groups_backup SELECT * FROM user_permission_groups"
                    );
                    log.info("✓ Đã tạo backup dữ liệu thành công");
                } catch (DataAccessException e) {
                    log.warn("❌ Không thể backup dữ liệu: {}", e.getMessage());
                    // Tiếp tục dù không backup được
                }
                
                log.info("Xóa và tạo lại bảng user_permission_groups...");
                
                // Xóa và tạo lại bảng với cấu trúc đúng
                jdbcTemplate.execute("DROP TABLE IF EXISTS user_permission_groups");
            }
            
            // Tạo bảng mới với cấu trúc đúng
            log.info("Tạo bảng mới với cấu trúc đúng...");
            jdbcTemplate.execute(
                "CREATE TABLE user_permission_groups (" +
                "  user_id BINARY(16) NOT NULL," +
                "  permission_group_id BINARY(16) NOT NULL," +
                "  PRIMARY KEY (user_id, permission_group_id)," +
                "  CONSTRAINT fk_upg_user_id FOREIGN KEY (user_id) " +
                "    REFERENCES users(id) ON DELETE CASCADE," +
                "  CONSTRAINT fk_upg_permission_group_id FOREIGN KEY (permission_group_id) " +
                "    REFERENCES permission_groups(id) ON DELETE CASCADE" +
                ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci"
            );
            
            log.info("✓ Đã tạo lại bảng thành công với cấu trúc đúng");
            
            if (tableExists != null && tableExists) {
                // Kiểm tra xem backup có cột group_id không
                Boolean hasGroupId = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) > 0 FROM information_schema.columns " +
                    "WHERE table_schema = DATABASE() " +
                    "AND table_name = 'user_permission_groups_backup' " +
                    "AND column_name = 'group_id'", 
                    Boolean.class);
                    
                // Cố gắng khôi phục dữ liệu từ backup
                try {
                    if (hasGroupId != null && hasGroupId) {
                        // Nếu có cột group_id, ánh xạ nó sang permission_group_id
                        log.info("Khôi phục dữ liệu với chuyển đổi từ group_id sang permission_group_id...");
                        jdbcTemplate.update(
                            "INSERT IGNORE INTO user_permission_groups (user_id, permission_group_id) " +
                            "SELECT user_id, group_id FROM user_permission_groups_backup"
                        );
                    } else {
                        // Nếu không có cột group_id, sao chép trực tiếp
                        log.info("Khôi phục dữ liệu trực tiếp từ backup...");
                        jdbcTemplate.update(
                            "INSERT IGNORE INTO user_permission_groups " +
                            "SELECT * FROM user_permission_groups_backup"
                        );
                    }
                    
                    // Đếm số dòng đã khôi phục
                    Integer restoredRows = jdbcTemplate.queryForObject(
                        "SELECT COUNT(*) FROM user_permission_groups", 
                        Integer.class);
                    
                    log.info("✓ Đã khôi phục {} dòng dữ liệu từ backup", restoredRows != null ? restoredRows : 0);
                } catch (DataAccessException e) {
                    log.warn("❌ Không thể khôi phục dữ liệu từ backup: {}", e.getMessage());
                    // Tiếp tục dù không khôi phục được
                }
                
                // Xóa bảng backup
                try {
                    jdbcTemplate.execute("DROP TABLE IF EXISTS user_permission_groups_backup");
                    log.info("✓ Đã xóa bảng backup");
                } catch (DataAccessException e) {
                    log.warn("⚠️ Không thể xóa bảng backup: {}", e.getMessage());
                    // Không quan trọng, tiếp tục
                }
            }
        } catch (Exception e) {
            log.error("❌ Lỗi khi tạo lại bảng: {}", e.getMessage());
            throw e;
        }
    }
    
    /**
     * Xác nhận cấu trúc bảng sau khi sửa
     */
    private void verifyTableStructure() {
        try {
            log.info("Xác nhận cấu trúc bảng sau khi sửa...");
            
            // Kiểm tra xem bảng có tồn tại không
            Boolean tableExists = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) > 0 FROM information_schema.tables " +
                "WHERE table_schema = DATABASE() AND table_name = 'user_permission_groups'", 
                Boolean.class);
                
            if (tableExists == null || !tableExists) {
                log.error("❌ NGHIÊM TRỌNG: Bảng user_permission_groups không tồn tại sau khi sửa!");
                return;
            }
            
            // Kiểm tra cột permission_group_id
            Boolean hasPermissionGroupId = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) > 0 FROM information_schema.columns " +
                "WHERE table_schema = DATABASE() " +
                "AND table_name = 'user_permission_groups' " +
                "AND column_name = 'permission_group_id'", 
                Boolean.class);
                
            if (hasPermissionGroupId == null || !hasPermissionGroupId) {
                log.error("❌ NGHIÊM TRỌNG: Cột permission_group_id không tồn tại sau khi sửa!");
                return;
            }
            
            // Kiểm tra khóa ngoại permission_group_id
            Boolean hasForeignKey = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) > 0 FROM information_schema.key_column_usage " +
                "WHERE table_schema = DATABASE() " +
                "AND table_name = 'user_permission_groups' " +
                "AND column_name = 'permission_group_id' " +
                "AND referenced_table_name = 'permission_groups'", 
                Boolean.class);
                
            if (hasForeignKey == null || !hasForeignKey) {
                log.warn("⚠️ Khóa ngoại cho permission_group_id không được thiết lập đúng!");
            } else {
                log.info("✓ Khóa ngoại cho permission_group_id được thiết lập đúng");
            }
            
            // Kiểm tra cấu trúc bảng hoàn chỉnh
            log.info("✓ Cấu trúc bảng user_permission_groups đã được sửa thành công!");
            
            // Thử câu truy vấn đơn giản để kiểm tra hoạt động
            try {
                jdbcTemplate.queryForList("SELECT user_id, permission_group_id FROM user_permission_groups LIMIT 1");
                log.info("✓ Có thể truy vấn dữ liệu từ bảng user_permission_groups");
            } catch (Exception e) {
                log.warn("⚠️ Không thể truy vấn dữ liệu từ bảng: {}", e.getMessage());
            }
        } catch (Exception e) {
            log.error("❌ Lỗi khi xác nhận cấu trúc bảng: {}", e.getMessage());
        }
    }
} 