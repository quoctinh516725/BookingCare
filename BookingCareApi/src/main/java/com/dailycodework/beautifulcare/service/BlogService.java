package com.dailycodework.beautifulcare.service;

import com.dailycodework.beautifulcare.dto.BlogDTO;
import com.dailycodework.beautifulcare.dto.BlogRequest;
import com.dailycodework.beautifulcare.entity.BlogStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

/**
 * Service interface cho quản lý blog
 */
public interface BlogService {
    
    /**
     * Lấy danh sách tất cả bài viết blog
     */
    List<BlogDTO> getAllBlogs();
    
    /**
     * Lấy danh sách bài viết blog với phân trang
     */
    Page<BlogDTO> getAllBlogs(Pageable pageable);
    
    /**
     * Lấy danh sách bài viết blog theo trạng thái
     */
    List<BlogDTO> getBlogsByStatus(BlogStatus status);
    
    /**
     * Lấy danh sách bài viết blog theo trạng thái với phân trang
     */
    Page<BlogDTO> getBlogsByStatus(BlogStatus status, Pageable pageable);
    
    /**
     * Lấy chi tiết bài viết blog theo ID
     */
    BlogDTO getBlogById(UUID id);
    
    /**
     * Lấy chi tiết bài viết blog theo slug
     */
    BlogDTO getBlogBySlug(String slug);
    
    /**
     * Tìm kiếm bài viết blog theo từ khóa
     */
    List<BlogDTO> searchBlogs(String keyword);
    
    /**
     * Tìm kiếm bài viết blog theo từ khóa với phân trang
     */
    Page<BlogDTO> searchBlogs(String keyword, Pageable pageable);
    
    /**
     * Lấy danh sách bài viết blog theo danh mục
     */
    List<BlogDTO> getBlogsByCategory(UUID categoryId);
    
    /**
     * Lấy danh sách bài viết blog theo danh mục với phân trang
     */
    Page<BlogDTO> getBlogsByCategory(UUID categoryId, Pageable pageable);
    
    /**
     * Tạo bài viết blog mới
     */
    BlogDTO createBlog(BlogRequest request);
    
    /**
     * Cập nhật bài viết blog
     */
    BlogDTO updateBlog(UUID id, BlogRequest request);
    
    /**
     * Xóa bài viết blog
     */
    void deleteBlog(UUID id);
    
    /**
     * Lấy số lượng bài viết blog theo trạng thái
     */
    long countBlogsByStatus(BlogStatus status);
} 