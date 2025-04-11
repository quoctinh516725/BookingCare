package com.dailycodework.beautifulcare.repository;

import com.dailycodework.beautifulcare.entity.Blog;
import com.dailycodework.beautifulcare.entity.BlogCategory;
import com.dailycodework.beautifulcare.entity.BlogStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository cho thao tác với bài viết blog
 */
@Repository
public interface BlogRepository extends JpaRepository<Blog, UUID> {
    
    /**
     * Tìm bài viết theo trạng thái
     */
    List<Blog> findByStatus(BlogStatus status);
    
    /**
     * Tìm bài viết theo trạng thái với phân trang
     */
    Page<Blog> findByStatus(BlogStatus status, Pageable pageable);
    
    /**
     * Tìm bài viết theo danh mục
     */
    List<Blog> findByCategory(BlogCategory category);
    
    /**
     * Tìm bài viết theo danh mục với phân trang
     */
    Page<Blog> findByCategory(BlogCategory category, Pageable pageable);
    
    /**
     * Tìm bài viết theo slug
     */
    Optional<Blog> findBySlug(String slug);
    
    /**
     * Tìm kiếm bài viết theo từ khóa
     */
    @Query("SELECT b FROM Blog b WHERE " +
           "LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.content) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.excerpt) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Blog> searchBlogs(@Param("keyword") String keyword);
    
    /**
     * Tìm kiếm bài viết theo từ khóa với phân trang
     */
    @Query("SELECT b FROM Blog b WHERE " +
           "LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.content) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(b.excerpt) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Blog> searchBlogs(@Param("keyword") String keyword, Pageable pageable);
    
    /**
     * Kiểm tra slug đã tồn tại hay chưa
     */
    boolean existsBySlug(String slug);
    
    /**
     * Kiểm tra slug đã tồn tại cho bài viết khác hay chưa
     */
    boolean existsBySlugAndIdNot(String slug, UUID id);
    
    /**
     * Đếm số bài viết theo danh mục
     */
    long countByCategory(BlogCategory category);
    
    /**
     * Đếm số bài viết theo trạng thái
     */
    long countByStatus(BlogStatus status);
} 