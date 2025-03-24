package com.dailycodework.beautifulcare.service;

import com.dailycodework.beautifulcare.dto.response.BlogCategoryResponse;

import java.util.List;

public interface BlogCategoryService {
    BlogCategoryResponse createCategory(String name, String description);

    BlogCategoryResponse getCategoryById(String id);

    BlogCategoryResponse getCategoryByName(String name);

    List<BlogCategoryResponse> getAllCategories();

    BlogCategoryResponse updateCategory(String id, String name, String description);

    void deleteCategory(String id);

    void deleteCategoryAndReassignBlogs(String categoryId, String targetCategoryId);
}