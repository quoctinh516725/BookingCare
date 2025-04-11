package com.dailycodework.beautifulcare.dto;

import com.dailycodework.beautifulcare.entity.BlogStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO cho request tạo mới hoặc cập nhật thông tin bài viết blog
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlogRequest {
    @NotBlank(message = "Tiêu đề không được để trống")
    @Size(max = 255, message = "Tiêu đề không được vượt quá 255 ký tự")
    private String title;
    
    @NotBlank(message = "Nội dung không được để trống")
    private String content;
    
    @Size(max = 500, message = "Tóm tắt không được vượt quá 500 ký tự")
    private String excerpt;
    
    private String slug;
    
    @NotNull(message = "Danh mục không được để trống")
    private UUID categoryId;
    
    private String thumbnailUrl;
    
    private BlogStatus status;
} 