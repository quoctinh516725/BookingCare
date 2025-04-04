package com.dailycodework.beautifulcare.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

/**
 * DTO cho phản hồi thông tin nhóm quyền.
 * Được thiết kế để tránh các tham chiếu vòng tròn khi tuần tự hóa dữ liệu.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermissionGroupResponse {
    private UUID id;
    private String name;
    private String description;
    private Set<PermissionResponse> permissions;
    private int userCount; // Số lượng người dùng có nhóm quyền này
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 