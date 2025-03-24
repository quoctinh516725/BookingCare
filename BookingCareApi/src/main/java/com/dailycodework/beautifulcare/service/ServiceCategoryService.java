package com.dailycodework.beautifulcare.service;

import com.dailycodework.beautifulcare.dto.request.ServiceCategoryCreateRequest;
import com.dailycodework.beautifulcare.dto.request.ServiceCategoryUpdateRequest;
import com.dailycodework.beautifulcare.dto.response.ServiceCategoryResponse;

import java.util.List;

public interface ServiceCategoryService {
    ServiceCategoryResponse createCategory(ServiceCategoryCreateRequest request);

    ServiceCategoryResponse getCategoryById(String id);

    ServiceCategoryResponse getCategoryByName(String name);

    List<ServiceCategoryResponse> getAllCategories();

    ServiceCategoryResponse updateCategory(String id, ServiceCategoryUpdateRequest request);

    void deleteCategory(String id);

    boolean existsByName(String name);
}