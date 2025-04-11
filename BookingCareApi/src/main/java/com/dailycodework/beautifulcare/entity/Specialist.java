package com.dailycodework.beautifulcare.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Entity đại diện cho một chuyên gia trong hệ thống
 */
@Entity
@Table(name = "specialists")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Specialist {
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(name = "id", columnDefinition = "BINARY(16)")
    private UUID id;
    
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;
    
    @Column(name = "specialty", length = 100)
    private String specialty;  // Chuyên môn
    
    @Column(name = "qualification", length = 255)
    private String qualification;  // Bằng cấp, chứng chỉ
    
    @Column(name = "experience", length = 100)
    private String experience;  // Kinh nghiệm làm việc
    
    @Column(name = "rating")
    private Float rating;  // Đánh giá từ 0-5
    
    // Ảnh đại diện chính
    @Column(name = "avatar_url", length = 255)
    private String avatarUrl;  
    
    // Danh sách các ảnh bổ sung của chuyên gia
    @ElementCollection
    @CollectionTable(
        name = "specialist_images",
        joinColumns = @JoinColumn(name = "specialist_id")
    )
    @Column(name = "image_url", length = 255)
    @Builder.Default
    private List<String> images = new ArrayList<>();
    
    @Column(name = "working_hours", length = 255)
    private String workingHours;  // Giờ làm việc
    
    @Column(name = "biography", length = 1000)
    private String biography;  // Tiểu sử chi tiết
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private SpecialistStatus status = SpecialistStatus.ACTIVE;  // Trạng thái hoạt động
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    /**
     * Thêm một URL ảnh vào danh sách ảnh của chuyên gia
     * @param imageUrl URL của ảnh cần thêm
     */
    public void addImage(String imageUrl) {
        if (images == null) {
            images = new ArrayList<>();
        }
        images.add(imageUrl);
    }
    
    /**
     * Xóa một URL ảnh khỏi danh sách ảnh của chuyên gia
     * @param imageUrl URL ảnh cần xóa
     * @return true nếu xóa thành công, false nếu không tìm thấy
     */
    public boolean removeImage(String imageUrl) {
        if (images == null) {
            return false;
        }
        return images.remove(imageUrl);
    }
} 