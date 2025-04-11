package com.dailycodework.beautifulcare.service;

import com.dailycodework.beautifulcare.dto.BlogCategoryDTO;
import com.dailycodework.beautifulcare.dto.BlogCategoryRequest;
import com.dailycodework.beautifulcare.entity.CategoryStatus;

import java.util.List;
import java.util.UUID;

/**
 * Service interface cho quản lý danh mục blog
 */
public interface BlogCategoryService {
    
    /**
     * Lấy danh sách tất cả danh mục blog
     */
    List<BlogCategoryDTO> getAllCategories();
    
    /**
     * Lấy danh sách danh mục blog theo trạng thái
     */
    List<BlogCategoryDTO> getCategoriesByStatus(CategoryStatus status);
    
    /**
     * Lấy chi tiết danh mục blog theo ID
     */
    BlogCategoryDTO getCategoryById(UUID id);
    
    /**
     * Lấy chi tiết danh mục blog theo slug
     */
    BlogCategoryDTO getCategoryBySlug(String slug);
    
    /**
     * Tạo danh mục blog mới
     */
    BlogCategoryDTO createCategory(BlogCategoryRequest request);
    
    /**
     * Cập nhật danh mục blog
     */
    BlogCategoryDTO updateCategory(UUID id, BlogCategoryRequest request);
    
    /**
     * Xóa danh mục blog
     */
    void deleteCategory(UUID id);
    
    /**
     * Kiểm tra danh mục có bài viết không
     */
    boolean categoryHasBlogs(UUID id);
    
    /**
     * Đếm số bài viết trong danh mục
     */
    long countBlogsByCategory(UUID categoryId);
} 