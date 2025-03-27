package com.dailycodework.beautifulcare.dto.response.base;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * Lớp cơ sở cho các response DTO có các trường chung như id, createdAt,
 * updatedAt.
 * Giúp giảm mã lặp lại và đảm bảo tính nhất quán trong thiết kế.
 */
@Data
public abstract class BaseResponse {
    private String id;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}