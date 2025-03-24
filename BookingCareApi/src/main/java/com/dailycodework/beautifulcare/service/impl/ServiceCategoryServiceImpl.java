package com.dailycodework.beautifulcare.service.impl;

import com.dailycodework.beautifulcare.dto.request.ServiceCategoryCreateRequest;
import com.dailycodework.beautifulcare.dto.request.ServiceCategoryUpdateRequest;
import com.dailycodework.beautifulcare.dto.response.ServiceCategoryResponse;
import com.dailycodework.beautifulcare.entity.ServiceCategory;
import com.dailycodework.beautifulcare.exception.AppException;
import com.dailycodework.beautifulcare.exception.ErrorCode;
import com.dailycodework.beautifulcare.mapper.ServiceCategoryMapper;
import com.dailycodework.beautifulcare.repository.ServiceCategoryRepository;
import com.dailycodework.beautifulcare.service.ServiceCategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class ServiceCategoryServiceImpl implements ServiceCategoryService {

    private final ServiceCategoryRepository serviceCategoryRepository;
    private final ServiceCategoryMapper serviceCategoryMapper;

    @Override
    @Transactional
    public ServiceCategoryResponse createCategory(ServiceCategoryCreateRequest request) {
        log.info("Creating new service category with name: {}", request.getName());
        if (request == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Category create request cannot be null");
        }

        if (serviceCategoryRepository.existsByName(request.getName())) {
            log.warn("Category with name {} already exists", request.getName());
            throw new AppException(ErrorCode.SERVICE_CATEGORY_ALREADY_EXISTS);
        }

        try {
            ServiceCategory category = serviceCategoryMapper.toEntity(request);
            ServiceCategory savedCategory = serviceCategoryRepository.save(category);
            log.info("Service category created successfully with id: {}", savedCategory.getId());
            return serviceCategoryMapper.toResponse(savedCategory);
        } catch (Exception e) {
            log.error("Error creating service category: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR,
                    "Error creating service category: " + e.getMessage());
        }
    }

    @Override
    public ServiceCategoryResponse getCategoryById(String id) {
        log.info("Fetching service category with id: {}", id);
        if (id == null || id.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Category id cannot be null or empty");
        }

        ServiceCategory category = serviceCategoryRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Category with id {} not found", id);
                    return new AppException(ErrorCode.SERVICE_CATEGORY_NOT_FOUND);
                });

        return serviceCategoryMapper.toResponse(category);
    }

    @Override
    public ServiceCategoryResponse getCategoryByName(String name) {
        log.info("Fetching service category with name: {}", name);
        if (name == null || name.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Category name cannot be null or empty");
        }

        ServiceCategory category = serviceCategoryRepository.findByName(name)
                .orElseThrow(() -> {
                    log.error("Category with name {} not found", name);
                    return new AppException(ErrorCode.SERVICE_CATEGORY_NOT_FOUND);
                });

        return serviceCategoryMapper.toResponse(category);
    }

    @Override
    public List<ServiceCategoryResponse> getAllCategories() {
        log.info("Fetching all service categories");
        try {
            List<ServiceCategory> categories = serviceCategoryRepository.findAll();
            if (categories.isEmpty()) {
                log.info("No service categories found");
                return Collections.emptyList();
            }

            return categories.stream()
                    .map(serviceCategoryMapper::toResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching all service categories: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Error fetching all service categories");
        }
    }

    @Override
    @Transactional
    public ServiceCategoryResponse updateCategory(String id, ServiceCategoryUpdateRequest request) {
        log.info("Updating service category with id: {}", id);
        if (id == null || id.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Category id cannot be null or empty");
        }

        if (request == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Category update request cannot be null");
        }

        ServiceCategory category = serviceCategoryRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Category with id {} not found for update", id);
                    return new AppException(ErrorCode.SERVICE_CATEGORY_NOT_FOUND);
                });

        if (request.getName() != null && !request.getName().equals(category.getName())) {
            if (serviceCategoryRepository.existsByName(request.getName())) {
                log.warn("Another category with name {} already exists", request.getName());
                throw new AppException(ErrorCode.SERVICE_CATEGORY_ALREADY_EXISTS);
            }
        }

        try {
            serviceCategoryMapper.updateEntity(category, request);
            ServiceCategory updatedCategory = serviceCategoryRepository.save(category);
            log.info("Service category updated successfully with id: {}", updatedCategory.getId());
            return serviceCategoryMapper.toResponse(updatedCategory);
        } catch (Exception e) {
            log.error("Error updating service category: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR,
                    "Error updating service category: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void deleteCategory(String id) {
        log.info("Deleting service category with id: {}", id);
        if (id == null || id.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Category id cannot be null or empty");
        }

        if (!serviceCategoryRepository.existsById(id)) {
            log.error("Category with id {} not found for deletion", id);
            throw new AppException(ErrorCode.SERVICE_CATEGORY_NOT_FOUND);
        }

        try {
            serviceCategoryRepository.deleteById(id);
            log.info("Service category deleted successfully with id: {}", id);
        } catch (Exception e) {
            log.error("Error deleting service category: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR,
                    "Error deleting service category: " + e.getMessage());
        }
    }

    @Override
    public boolean existsByName(String name) {
        log.info("Checking if service category exists with name: {}", name);
        if (name == null || name.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Category name cannot be null or empty");
        }

        return serviceCategoryRepository.existsByName(name);
    }
}