package com.dailycodework.beautifulcare.dto;

import com.dailycodework.beautifulcare.entity.BlogStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO cho thông tin bài viết blog
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlogDTO {
    private UUID id;
    private String title;
    private String content;
    private String excerpt;
    private String slug;
    private UUID categoryId;
    private String categoryName;
    private UUID authorId;
    private String authorName;
    private String thumbnailUrl;
    private BlogStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 