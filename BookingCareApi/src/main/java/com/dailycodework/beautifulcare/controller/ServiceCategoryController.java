package com.dailycodework.beautifulcare.controller;

import com.dailycodework.beautifulcare.dto.request.ServiceCategoryCreateRequest;
import com.dailycodework.beautifulcare.dto.request.ServiceCategoryUpdateRequest;
import com.dailycodework.beautifulcare.dto.response.ApiResponse;
import com.dailycodework.beautifulcare.dto.response.ServiceCategoryResponse;
import com.dailycodework.beautifulcare.service.ServiceCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/service-categories")
@RequiredArgsConstructor
@Slf4j
public class ServiceCategoryController {

    private final ServiceCategoryService serviceCategoryService;

    @PostMapping
    public ResponseEntity<ApiResponse<ServiceCategoryResponse>> createCategory(
            @Valid @RequestBody ServiceCategoryCreateRequest request) {
        log.info("REST request to create a new service category");
        ServiceCategoryResponse response = serviceCategoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Service category created successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ServiceCategoryResponse>> getCategoryById(@PathVariable String id) {
        log.info("REST request to get category by id: {}", id);
        ServiceCategoryResponse response = serviceCategoryService.getCategoryById(id);
        return ResponseEntity.ok(ApiResponse.success("Service category retrieved successfully", response));
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<ApiResponse<ServiceCategoryResponse>> getCategoryByName(@PathVariable String name) {
        log.info("REST request to get category by name: {}", name);
        ServiceCategoryResponse response = serviceCategoryService.getCategoryByName(name);
        return ResponseEntity.ok(ApiResponse.success("Service category retrieved successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ServiceCategoryResponse>>> getAllCategories() {
        log.info("REST request to get all categories");
        List<ServiceCategoryResponse> responses = serviceCategoryService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success("Service categories retrieved successfully", responses));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ServiceCategoryResponse>> updateCategory(
            @PathVariable String id,
            @Valid @RequestBody ServiceCategoryUpdateRequest request) {
        log.info("REST request to update category with id: {}", id);
        ServiceCategoryResponse response = serviceCategoryService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponse.success("Service category updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable String id) {
        log.info("REST request to delete category with id: {}", id);
        serviceCategoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Service category deleted successfully", null));
    }
}