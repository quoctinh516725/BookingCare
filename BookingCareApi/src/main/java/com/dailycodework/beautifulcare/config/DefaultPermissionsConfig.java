package com.dailycodework.beautifulcare.config;

import com.dailycodework.beautifulcare.entity.Permission;
import com.dailycodework.beautifulcare.entity.PermissionGroup;
import com.dailycodework.beautifulcare.repository.PermissionGroupRepository;
import com.dailycodework.beautifulcare.repository.PermissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Cấu hình để tạo các quyền và nhóm quyền mặc định khi ứng dụng khởi động
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
public class DefaultPermissionsConfig {
    
    private final PermissionRepository permissionRepository;
    private final PermissionGroupRepository permissionGroupRepository;
    
    @Bean
    public CommandLineRunner initDefaultPermissions() {
        return args -> {
            // Chỉ khởi tạo nếu chưa có quyền nào
            if (permissionRepository.count() == 0) {
                log.info("Initializing default permissions...");
                initializePermissions();
            }
            
            // Chỉ khởi tạo nếu chưa có nhóm quyền nào
            if (permissionGroupRepository.count() == 0) {
                log.info("Initializing default permission groups...");
                initializePermissionGroups();
            }
        };
    }
    
    private void initializePermissions() {
        // ===== QUẢN LÝ NGƯỜI DÙNG =====
        createPermissionIfNotExists("VIEW_USERS", "Xem danh sách người dùng", "user:view");
        createPermissionIfNotExists("VIEW_USER_DETAILS", "Xem chi tiết người dùng", "user:view-details");
        createPermissionIfNotExists("CREATE_USER", "Tạo người dùng mới", "user:create");
        createPermissionIfNotExists("UPDATE_USER", "Cập nhật thông tin người dùng", "user:update");
        createPermissionIfNotExists("DELETE_USER", "Xóa người dùng", "user:delete");
        createPermissionIfNotExists("CHANGE_USER_ROLE", "Thay đổi vai trò người dùng", "user:change-role");
        
        // ===== QUẢN LÝ DỊCH VỤ =====
        createPermissionIfNotExists("VIEW_SERVICES", "Xem danh sách dịch vụ", "service:view");
        createPermissionIfNotExists("VIEW_SERVICE_DETAILS", "Xem chi tiết dịch vụ", "service:view-details");
        createPermissionIfNotExists("CREATE_SERVICE", "Tạo dịch vụ mới", "service:create");
        createPermissionIfNotExists("UPDATE_SERVICE", "Cập nhật thông tin dịch vụ", "service:update");
        createPermissionIfNotExists("DELETE_SERVICE", "Xóa dịch vụ", "service:delete");
        createPermissionIfNotExists("CHANGE_SERVICE_PRICE", "Thay đổi giá dịch vụ", "service:change-price");
        createPermissionIfNotExists("CHANGE_SERVICE_STATUS", "Kích hoạt/vô hiệu dịch vụ", "service:change-status");
        
        // ===== QUẢN LÝ LỊCH HẸN =====
        createPermissionIfNotExists("VIEW_BOOKINGS", "Xem danh sách lịch hẹn", "booking:view");
        createPermissionIfNotExists("VIEW_BOOKING_DETAILS", "Xem chi tiết lịch hẹn", "booking:view-details");
        createPermissionIfNotExists("CREATE_BOOKING", "Tạo lịch hẹn mới", "booking:create");
        createPermissionIfNotExists("UPDATE_BOOKING", "Cập nhật thông tin lịch hẹn", "booking:update");
        createPermissionIfNotExists("DELETE_BOOKING", "Xóa lịch hẹn", "booking:delete");
        createPermissionIfNotExists("UPDATE_BOOKING_STATUS", "Cập nhật trạng thái lịch hẹn", "booking:update-status");
        createPermissionIfNotExists("ASSIGN_STAFF_TO_BOOKING", "Phân công nhân viên cho lịch hẹn", "booking:assign-staff");
        createPermissionIfNotExists("CANCEL_BOOKING", "Hủy lịch hẹn", "booking:cancel");
        createPermissionIfNotExists("RESCHEDULE_BOOKING", "Đổi lịch hẹn", "booking:reschedule");
        
        // ===== QUẢN LÝ PHẢN HỒI =====
        createPermissionIfNotExists("VIEW_FEEDBACKS", "Xem đánh giá", "feedback:view");
        createPermissionIfNotExists("CREATE_FEEDBACK", "Tạo đánh giá", "feedback:create");
        createPermissionIfNotExists("RESPOND_TO_FEEDBACK", "Phản hồi đánh giá", "feedback:respond");
        createPermissionIfNotExists("DELETE_FEEDBACK", "Xóa đánh giá", "feedback:delete");
        
        // ===== QUẢN LÝ THANH TOÁN =====
        createPermissionIfNotExists("VIEW_PAYMENTS", "Xem danh sách thanh toán", "payment:view");
        createPermissionIfNotExists("PROCESS_PAYMENT", "Xử lý thanh toán", "payment:process");
        createPermissionIfNotExists("REFUND_PAYMENT", "Hoàn tiền", "payment:refund");
        createPermissionIfNotExists("GENERATE_INVOICE", "Tạo hóa đơn", "payment:generate-invoice");
        
        // ===== QUẢN LÝ BÁO CÁO & THỐNG KÊ =====
        createPermissionIfNotExists("VIEW_REPORTS", "Xem báo cáo", "report:view");
        createPermissionIfNotExists("VIEW_DASHBOARD", "Xem trang tổng quan", "dashboard:view");
        createPermissionIfNotExists("EXPORT_DATA", "Xuất dữ liệu", "data:export");
        createPermissionIfNotExists("VIEW_REVENUE_STATS", "Xem thống kê doanh thu", "stats:revenue");
        createPermissionIfNotExists("VIEW_BOOKING_STATS", "Xem thống kê lịch hẹn", "stats:booking");
        createPermissionIfNotExists("VIEW_USER_STATS", "Xem thống kê người dùng", "stats:user");
        
        // ===== QUẢN LÝ NHÂN VIÊN =====
        createPermissionIfNotExists("VIEW_STAFF", "Xem danh sách nhân viên", "staff:view");
        createPermissionIfNotExists("MANAGE_STAFF_SCHEDULE", "Quản lý lịch làm việc của nhân viên", "staff:manage-schedule");
        createPermissionIfNotExists("VIEW_STAFF_PERFORMANCE", "Xem thống kê hiệu suất nhân viên", "staff:view-performance");
        
        // ===== QUẢN LÝ HỆ THỐNG =====
        createPermissionIfNotExists("MANAGE_PERMISSIONS", "Quản lý quyền hạn", "permission:manage");
        createPermissionIfNotExists("MANAGE_SETTINGS", "Quản lý cài đặt hệ thống", "settings:manage");
        createPermissionIfNotExists("VIEW_LOGS", "Xem nhật ký hệ thống", "logs:view");
        createPermissionIfNotExists("BACKUP_DATA", "Sao lưu dữ liệu", "system:backup");
        createPermissionIfNotExists("RESTORE_DATA", "Phục hồi dữ liệu", "system:restore");
        
        log.info("Default permissions initialized successfully");
    }
    
    private void initializePermissionGroups() {
        Map<String, String[]> defaultGroups = new HashMap<>();
        
        // ==== NHÓM QUYỀN CHO KHÁCH HÀNG ====
        defaultGroups.put("Khách hàng", new String[]{
            "VIEW_USERS", "VIEW_USER_DETAILS",
            "VIEW_SERVICES", "VIEW_SERVICE_DETAILS",
            "VIEW_BOOKINGS", "VIEW_BOOKING_DETAILS", "CREATE_BOOKING", "UPDATE_BOOKING",
            "VIEW_FEEDBACKS", "CREATE_FEEDBACK"
        });
        
        // ==== NHÓM QUYỀN CHO NHÂN VIÊN ====
        
        // Nhân viên lễ tân
        defaultGroups.put("Nhân viên lễ tân", new String[]{
            "VIEW_USERS", "VIEW_USER_DETAILS",
            "VIEW_SERVICES", "VIEW_SERVICE_DETAILS",
            "VIEW_BOOKINGS", "VIEW_BOOKING_DETAILS", "CREATE_BOOKING", "UPDATE_BOOKING", "UPDATE_BOOKING_STATUS",
            "VIEW_DASHBOARD", "CANCEL_BOOKING", "RESCHEDULE_BOOKING",
            "VIEW_STAFF", "ASSIGN_STAFF_TO_BOOKING"
        });
        
        // Nhân viên kỹ thuật
        defaultGroups.put("Nhân viên kỹ thuật", new String[]{
            "VIEW_BOOKINGS", "VIEW_BOOKING_DETAILS", "UPDATE_BOOKING_STATUS",
            "VIEW_SERVICES", "VIEW_SERVICE_DETAILS",
            "VIEW_USERS", "VIEW_USER_DETAILS",
            "VIEW_FEEDBACKS", "RESPOND_TO_FEEDBACK"
        });
        
        // Nhân viên quản lý dịch vụ
        defaultGroups.put("Quản lý dịch vụ", new String[]{
            "VIEW_SERVICES", "VIEW_SERVICE_DETAILS", "CREATE_SERVICE", "UPDATE_SERVICE", 
            "DELETE_SERVICE", "CHANGE_SERVICE_PRICE", "CHANGE_SERVICE_STATUS",
            "VIEW_BOOKING_STATS", "VIEW_DASHBOARD"
        });
        
        // ==== NHÓM QUYỀN THEO CHỨC NĂNG ====
        
        // Quản lý người dùng
        defaultGroups.put("Quản lý người dùng", new String[]{
            "VIEW_USERS", "VIEW_USER_DETAILS", "CREATE_USER", "UPDATE_USER", 
            "DELETE_USER", "CHANGE_USER_ROLE", "VIEW_USER_STATS"
        });
        
        // Quản lý lịch hẹn
        defaultGroups.put("Quản lý lịch hẹn", new String[]{
            "VIEW_BOOKINGS", "VIEW_BOOKING_DETAILS", "CREATE_BOOKING", "UPDATE_BOOKING", 
            "DELETE_BOOKING", "UPDATE_BOOKING_STATUS", "ASSIGN_STAFF_TO_BOOKING", 
            "CANCEL_BOOKING", "RESCHEDULE_BOOKING", "VIEW_BOOKING_STATS"
        });
        
        // Quản lý phản hồi
        defaultGroups.put("Quản lý phản hồi", new String[]{
            "VIEW_FEEDBACKS", "RESPOND_TO_FEEDBACK", "DELETE_FEEDBACK"
        });
        
        // Quản lý thanh toán
        defaultGroups.put("Quản lý thanh toán", new String[]{
            "VIEW_PAYMENTS", "PROCESS_PAYMENT", "REFUND_PAYMENT", "GENERATE_INVOICE",
            "VIEW_REVENUE_STATS"
        });
        
        // Quản lý báo cáo
        defaultGroups.put("Quản lý báo cáo", new String[]{
            "VIEW_REPORTS", "VIEW_DASHBOARD", "EXPORT_DATA",
            "VIEW_REVENUE_STATS", "VIEW_BOOKING_STATS", "VIEW_USER_STATS"
        });
        
        // Quản lý nhân viên
        defaultGroups.put("Quản lý nhân viên", new String[]{
            "VIEW_STAFF", "MANAGE_STAFF_SCHEDULE", "VIEW_STAFF_PERFORMANCE"
        });
        
        // ==== NHÓM QUYỀN NÂNG CAO ====
        
        // Quản trị hệ thống
        defaultGroups.put("Quản trị hệ thống", new String[]{
            "MANAGE_PERMISSIONS", "MANAGE_SETTINGS", "VIEW_LOGS", 
            "BACKUP_DATA", "RESTORE_DATA"
        });
        
        // Tạo các nhóm quyền
        for (Map.Entry<String, String[]> entry : defaultGroups.entrySet()) {
            String groupName = entry.getKey();
            String[] permissionNames = entry.getValue();
            
            createPermissionGroupIfNotExists(groupName, permissionNames);
        }
        
        log.info("Default permission groups initialized successfully");
    }
    
    private Permission createPermissionIfNotExists(String name, String description, String code) {
        Optional<Permission> existingPermission = permissionRepository.findByCode(code);
        
        if (existingPermission.isPresent()) {
            return existingPermission.get();
        }
        
        Permission permission = Permission.builder()
                .name(name)
                .description(description)
                .code(code)
                .build();
        
        return permissionRepository.save(permission);
    }
    
    private PermissionGroup createPermissionGroupIfNotExists(String name, String[] permissionNames) {
        Optional<PermissionGroup> existingGroup = permissionGroupRepository.findByName(name);
        
        if (existingGroup.isPresent()) {
            return existingGroup.get();
        }
        
        PermissionGroup group = PermissionGroup.builder()
                .name(name)
                .description("Nhóm quyền " + name.toLowerCase())
                .build();
        
        // Lưu trước để có ID
        group = permissionGroupRepository.save(group);
        
        // Thêm các quyền vào nhóm
        for (String permissionName : permissionNames) {
            Optional<Permission> permission = permissionRepository.findByName(permissionName);
            if (permission.isPresent()) {
                group.addPermission(permission.get());
            } else {
                log.warn("Permission not found: {}", permissionName);
            }
        }
        
        return permissionGroupRepository.save(group);
    }
} 