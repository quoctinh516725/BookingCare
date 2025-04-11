package com.dailycodework.beautifulcare.mapper;

import com.dailycodework.beautifulcare.dto.BlogDTO;
import com.dailycodework.beautifulcare.entity.Blog;
import org.springframework.stereotype.Component;

/**
 * Mapper for converting between Blog entity and DTO
 */
@Component
public class BlogMapper {
    
    /**
     * Chuyển đổi từ entity sang DTO
     */
    public BlogDTO toDTO(Blog blog) {
        if (blog == null) {
            return null;
        }
        
        return BlogDTO.builder()
                .id(blog.getId())
                .title(blog.getTitle())
                .content(blog.getContent())
                .excerpt(blog.getExcerpt())
                .slug(blog.getSlug())
                .categoryId(blog.getCategory() != null ? blog.getCategory().getId() : null)
                .categoryName(blog.getCategory() != null ? blog.getCategory().getName() : null)
                .authorId(blog.getAuthor() != null ? blog.getAuthor().getId() : null)
                .authorName(blog.getAuthor() != null ? 
                        (blog.getAuthor().getFirstName() + " " + blog.getAuthor().getLastName()).trim() 
                        : null)
                .thumbnailUrl(blog.getThumbnailUrl())
                .status(blog.getStatus())
                .createdAt(blog.getCreatedAt())
                .updatedAt(blog.getUpdatedAt())
                .build();
    }
} 