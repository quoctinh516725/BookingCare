package com.dailycodework.beautifulcare.service.impl;

import com.dailycodework.beautifulcare.dto.response.BlogCategoryResponse;
import com.dailycodework.beautifulcare.entity.Blog;
import com.dailycodework.beautifulcare.entity.BlogCategory;
import com.dailycodework.beautifulcare.exception.AppException;
import com.dailycodework.beautifulcare.exception.ErrorCode;
import com.dailycodework.beautifulcare.mapper.BlogCategoryMapper;
import com.dailycodework.beautifulcare.repository.BlogCategoryRepository;
import com.dailycodework.beautifulcare.repository.BlogRepository;
import com.dailycodework.beautifulcare.service.BlogCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class BlogCategoryServiceImpl implements BlogCategoryService {
    private final BlogCategoryRepository categoryRepository;
    private final BlogCategoryMapper categoryMapper;
    private final BlogRepository blogRepository;

    @Override
    public BlogCategoryResponse createCategory(String name, String description) {
        // Check if category with same name already exists
        categoryRepository.findByName(name).ifPresent(category -> {
            throw new AppException(ErrorCode.BLOG_CATEGORY_ALREADY_EXISTS,
                    "Blog category with name '" + name + "' already exists");
        });

        BlogCategory category = new BlogCategory();
        category.setName(name);
        category.setDescription(description);
        category.setCreatedAt(LocalDateTime.now());
        category.setUpdatedAt(LocalDateTime.now());

        BlogCategory savedCategory = categoryRepository.save(category);
        return categoryMapper.toBlogCategoryResponse(savedCategory);
    }

    @Override
    public BlogCategoryResponse getCategoryById(String id) {
        BlogCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BLOG_CATEGORY_NOT_FOUND,
                        "Blog category not found with ID: " + id));
        return categoryMapper.toBlogCategoryResponse(category);
    }

    @Override
    public BlogCategoryResponse getCategoryByName(String name) {
        BlogCategory category = categoryRepository.findByName(name)
                .orElseThrow(() -> new AppException(ErrorCode.BLOG_CATEGORY_NOT_FOUND,
                        "Blog category not found with name: " + name));
        return categoryMapper.toBlogCategoryResponse(category);
    }

    @Override
    public List<BlogCategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(categoryMapper::toBlogCategoryResponse)
                .collect(Collectors.toList());
    }

    @Override
    public BlogCategoryResponse updateCategory(String id, String name, String description) {
        BlogCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BLOG_CATEGORY_NOT_FOUND,
                        "Blog category not found with ID: " + id));

        // Check if another category with the updated name already exists
        categoryRepository.findByName(name).ifPresent(existingCategory -> {
            if (!existingCategory.getId().equals(id)) {
                throw new AppException(ErrorCode.BLOG_CATEGORY_ALREADY_EXISTS,
                        "Blog category with name '" + name + "' already exists");
            }
        });

        category.setName(name);
        category.setDescription(description);
        category.setUpdatedAt(LocalDateTime.now());

        BlogCategory updatedCategory = categoryRepository.save(category);
        return categoryMapper.toBlogCategoryResponse(updatedCategory);
    }

    @Override
    public void deleteCategory(String id) {
        BlogCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.BLOG_CATEGORY_NOT_FOUND,
                        "Blog category not found with ID: " + id));

        // Check if there are blogs in this category
        if (!category.getBlogs().isEmpty()) {
            throw new AppException(ErrorCode.BLOG_CATEGORY_HAS_BLOGS,
                    "Cannot delete category because it has associated blogs. Please remove or reassign these blogs first.");
        }

        try {
            categoryRepository.delete(category);
        } catch (Exception e) {
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR,
                    "Failed to delete blog category: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void deleteCategoryAndReassignBlogs(String categoryId, String targetCategoryId) {
        // Check if category exists
        BlogCategory categoryToDelete = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new AppException(ErrorCode.BLOG_CATEGORY_NOT_FOUND,
                        "Blog category not found with ID: " + categoryId));

        // Check if target category exists
        if (categoryId.equals(targetCategoryId)) {
            throw new AppException(ErrorCode.INVALID_REQUEST,
                    "Source and target categories cannot be the same");
        }

        BlogCategory targetCategory = categoryRepository.findById(targetCategoryId)
                .orElseThrow(() -> new AppException(ErrorCode.BLOG_CATEGORY_NOT_FOUND,
                        "Target blog category not found with ID: " + targetCategoryId));

        try {
            // Reassign all blogs from the old category to the new one
            List<Blog> blogs = blogRepository.findByCategory(categoryToDelete);

            for (Blog blog : blogs) {
                blog.setCategory(targetCategory);
            }

            // Save all updated blogs
            blogRepository.saveAll(blogs);

            // Delete the old category (now without blogs)
            categoryRepository.delete(categoryToDelete);
        } catch (Exception e) {
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR,
                    "Failed to reassign blogs and delete category: " + e.getMessage());
        }
    }
}