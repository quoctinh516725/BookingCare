package com.dailycodework.beautifulcare.service.impl;

import com.dailycodework.beautifulcare.dto.BlogCategoryDTO;
import com.dailycodework.beautifulcare.dto.BlogCategoryRequest;
import com.dailycodework.beautifulcare.entity.BlogCategory;
import com.dailycodework.beautifulcare.entity.CategoryStatus;
import com.dailycodework.beautifulcare.exception.BadRequestException;
import com.dailycodework.beautifulcare.exception.ResourceNotFoundException;
import com.dailycodework.beautifulcare.mapper.BlogCategoryMapper;
import com.dailycodework.beautifulcare.repository.BlogCategoryRepository;
import com.dailycodework.beautifulcare.repository.BlogRepository;
import com.dailycodework.beautifulcare.service.BlogCategoryService;
import com.dailycodework.beautifulcare.utils.SlugUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementation of BlogCategoryService
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BlogCategoryServiceImpl implements BlogCategoryService {

    private final BlogCategoryRepository categoryRepository;
    private final BlogRepository blogRepository;
    private final BlogCategoryMapper categoryMapper;

    @Override
    @Transactional(readOnly = true)
    public List<BlogCategoryDTO> getAllCategories() {
        List<BlogCategory> categories = categoryRepository.findAll();
        return categories.stream()
                .map(category -> {
                    int blogCount = (int) blogRepository.countByCategory(category);
                    return categoryMapper.toDTO(category, blogCount);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BlogCategoryDTO> getCategoriesByStatus(CategoryStatus status) {
        List<BlogCategory> categories = categoryRepository.findByStatus(status);
        return categories.stream()
                .map(category -> {
                    int blogCount = (int) blogRepository.countByCategory(category);
                    return categoryMapper.toDTO(category, blogCount);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BlogCategoryDTO getCategoryById(UUID id) {
        BlogCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        
        int blogCount = (int) blogRepository.countByCategory(category);
        return categoryMapper.toDTO(category, blogCount);
    }

    @Override
    @Transactional(readOnly = true)
    public BlogCategoryDTO getCategoryBySlug(String slug) {
        BlogCategory category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with slug: " + slug));
        
        int blogCount = (int) blogRepository.countByCategory(category);
        return categoryMapper.toDTO(category, blogCount);
    }

    @Override
    @Transactional
    public BlogCategoryDTO createCategory(BlogCategoryRequest request) {
        // Kiểm tra tên danh mục đã tồn tại chưa
        if (categoryRepository.existsByName(request.getName())) {
            throw new BadRequestException("Category with name '" + request.getName() + "' already exists");
        }
        
        // Tạo slug nếu chưa có
        String slug = request.getSlug();
        if (slug == null || slug.trim().isEmpty()) {
            slug = SlugUtils.createSlug(request.getName());
        }
        
        // Đảm bảo slug là duy nhất
        slug = ensureUniqueSlug(slug, null);
        
        // Tạo entity mới
        BlogCategory category = BlogCategory.builder()
                .name(request.getName())
                .slug(slug)
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : CategoryStatus.ACTIVE)
                .build();
        
        // Lưu vào database
        BlogCategory savedCategory = categoryRepository.save(category);
        log.info("Created new blog category: {}", savedCategory.getName());
        
        return categoryMapper.toDTO(savedCategory, 0);
    }

    @Override
    @Transactional
    public BlogCategoryDTO updateCategory(UUID id, BlogCategoryRequest request) {
        // Tìm danh mục cần cập nhật
        BlogCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        
        // Kiểm tra tên danh mục đã tồn tại chưa
        if (request.getName() != null && !request.getName().equals(category.getName())
                && categoryRepository.existsByNameAndIdNot(request.getName(), id)) {
            throw new BadRequestException("Category with name '" + request.getName() + "' already exists");
        }
        
        // Cập nhật slug nếu tên thay đổi
        if (request.getSlug() != null && !request.getSlug().isEmpty()) {
            String slug = ensureUniqueSlug(request.getSlug(), id);
            category.setSlug(slug);
        } else if (request.getName() != null && !request.getName().equals(category.getName())) {
            String slug = ensureUniqueSlug(SlugUtils.createSlug(request.getName()), id);
            category.setSlug(slug);
        }
        
        // Cập nhật các trường khác
        if (request.getName() != null) category.setName(request.getName());
        if (request.getDescription() != null) category.setDescription(request.getDescription());
        if (request.getStatus() != null) category.setStatus(request.getStatus());
        
        // Lưu vào database
        BlogCategory updatedCategory = categoryRepository.save(category);
        log.info("Updated blog category with id {}: {}", id, updatedCategory.getName());
        
        int blogCount = (int) blogRepository.countByCategory(updatedCategory);
        return categoryMapper.toDTO(updatedCategory, blogCount);
    }

    @Override
    @Transactional
    public void deleteCategory(UUID id) {
        BlogCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        
        // Kiểm tra xem danh mục có bài viết không
        if (categoryHasBlogs(id)) {
            throw new BadRequestException("Cannot delete category with existing blogs");
        }
        
        categoryRepository.delete(category);
        log.info("Deleted blog category with id: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean categoryHasBlogs(UUID id) {
        BlogCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        
        return blogRepository.countByCategory(category) > 0;
    }

    @Override
    @Transactional(readOnly = true)
    public long countBlogsByCategory(UUID categoryId) {
        BlogCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));
        
        return blogRepository.countByCategory(category);
    }
    
    /**
     * Đảm bảo slug là duy nhất
     * @param slug Slug ban đầu
     * @param categoryId ID của danh mục cần bỏ qua khi kiểm tra (dùng cho cập nhật)
     * @return Slug đã đảm bảo duy nhất
     */
    private String ensureUniqueSlug(String slug, UUID categoryId) {
        String finalSlug = slug;
        int counter = 1;
        
        while (categoryId == null ? 
                categoryRepository.existsBySlug(finalSlug) : 
                categoryRepository.existsBySlugAndIdNot(finalSlug, categoryId)) {
            finalSlug = slug + "-" + counter++;
        }
        
        return finalSlug;
    }
} 