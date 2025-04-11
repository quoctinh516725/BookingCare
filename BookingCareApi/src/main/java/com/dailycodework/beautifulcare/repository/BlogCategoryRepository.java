package com.dailycodework.beautifulcare.repository;

import com.dailycodework.beautifulcare.entity.BlogCategory;
import com.dailycodework.beautifulcare.entity.CategoryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository cho thao tác với danh mục blog
 */
@Repository
public interface BlogCategoryRepository extends JpaRepository<BlogCategory, UUID> {
    
    /**
     * Tìm danh mục theo trạng thái
     */
    List<BlogCategory> findByStatus(CategoryStatus status);
    
    /**
     * Tìm danh mục theo tên
     */
    Optional<BlogCategory> findByName(String name);
    
    /**
     * Tìm danh mục theo slug
     */
    Optional<BlogCategory> findBySlug(String slug);
    
    /**
     * Kiểm tra tên danh mục đã tồn tại chưa
     */
    boolean existsByName(String name);
    
    /**
     * Kiểm tra tên danh mục đã tồn tại cho danh mục khác chưa
     */
    boolean existsByNameAndIdNot(String name, UUID id);
    
    /**
     * Kiểm tra slug đã tồn tại chưa
     */
    boolean existsBySlug(String slug);
    
    /**
     * Kiểm tra slug đã tồn tại cho danh mục khác chưa
     */
    boolean existsBySlugAndIdNot(String slug, UUID id);
} 