package com.dailycodework.beautifulcare.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO cho phản hồi thông tin quyền.
 * Được thiết kế để tránh các tham chiếu vòng tròn khi tuần tự hóa dữ liệu.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermissionResponse {
    private UUID id;
    private String name;
    private String description;
    private String code;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 