package com.dailycodework.beautifulcare.mapper;

import com.dailycodework.beautifulcare.dto.BlogCategoryDTO;
import com.dailycodework.beautifulcare.entity.BlogCategory;
import org.springframework.stereotype.Component;

/**
 * Mapper for converting between BlogCategory entity and DTO
 */
@Component
public class BlogCategoryMapper {
    
    /**
     * Chuyển đổi từ entity sang DTO
     */
    public BlogCategoryDTO toDTO(BlogCategory category, int blogCount) {
        if (category == null) {
            return null;
        }
        
        return BlogCategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .status(category.getStatus())
                .blogCount(blogCount)
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }
    
    /**
     * Chuyển đổi từ entity sang DTO với số lượng bài viết mặc định từ danh sách blogs
     */
    public BlogCategoryDTO toDTO(BlogCategory category) {
        if (category == null) {
            return null;
        }
        
        return toDTO(category, category.getBlogs().size());
    }
} 