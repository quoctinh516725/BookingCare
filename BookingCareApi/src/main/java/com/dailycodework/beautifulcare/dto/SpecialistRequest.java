package com.dailycodework.beautifulcare.dto;

import com.dailycodework.beautifulcare.entity.SpecialistStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

/**
 * DTO cho request tạo mới hoặc cập nhật thông tin chuyên gia
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpecialistRequest {
    // User ID là bắt buộc khi tạo mới hoặc cập nhật
    @NotNull(message = "User ID không được để trống")
    private UUID userId;
    
    @Size(max = 100, message = "Chuyên môn không được vượt quá 100 ký tự")
    private String specialty;
    
    @Size(max = 255, message = "Bằng cấp không được vượt quá 255 ký tự")
    private String qualification;
    
    @Size(max = 100, message = "Kinh nghiệm không được vượt quá 100 ký tự")
    private String experience;
    
    private Float rating;
    
    @Size(max = 255, message = "URL avatar không được vượt quá 255 ký tự")
    private String avatarUrl;
    
    // Danh sách URL các ảnh bổ sung
    private List<String> images;
    
    @Size(max = 255, message = "Giờ làm việc không được vượt quá 255 ký tự")
    private String workingHours;
    
    @Size(max = 1000, message = "Tiểu sử không được vượt quá 1000 ký tự")
    private String biography;
    
    private SpecialistStatus status;
} 