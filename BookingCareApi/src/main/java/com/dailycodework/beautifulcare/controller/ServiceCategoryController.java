package com.dailycodework.beautifulcare.controller;

import com.dailycodework.beautifulcare.dto.request.ServiceCategoryRequest;
import com.dailycodework.beautifulcare.dto.response.ServiceCategoryResponse;
import com.dailycodework.beautifulcare.dto.response.ServiceResponse;
import com.dailycodework.beautifulcare.security.HasPermission;
import com.dailycodework.beautifulcare.service.ServiceCategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/service-categories")
@RequiredArgsConstructor
@Tag(name = "Service Category", description = "Service category management APIs")
@Slf4j
public class ServiceCategoryController {

    private final ServiceCategoryService serviceCategoryService;

    @GetMapping
    @Operation(summary = "Get all service categories")
    public ResponseEntity<List<ServiceCategoryResponse>> getAllCategories() {
        log.info("GET /api/v1/service-categories: Fetching all service categories");
        return ResponseEntity.ok(serviceCategoryService.getAllCategories());
    }
    
    @GetMapping("/active")
    @Operation(summary = "Get all active service categories")
    public ResponseEntity<List<ServiceCategoryResponse>> getActiveCategories() {
        log.info("GET /api/v1/service-categories/active: Fetching all active service categories");
        return ResponseEntity.ok(serviceCategoryService.getActiveCategories());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get service category by ID")
    public ResponseEntity<ServiceCategoryResponse> getCategoryById(@PathVariable UUID id) {
        log.info("GET /api/v1/service-categories/{}: Fetching service category", id);
        return ResponseEntity.ok(serviceCategoryService.getCategoryById(id));
    }

    @GetMapping("/{id}/services")
    @Operation(summary = "Get services by category ID")
    public ResponseEntity<List<ServiceResponse>> getServicesByCategory(@PathVariable UUID id) {
        log.info("GET /api/v1/service-categories/{}/services: Fetching services by category", id);
        return ResponseEntity.ok(serviceCategoryService.getServicesByCategory(id));
    }

    @PostMapping
    @Operation(summary = "Create new service category")
    @HasPermission("service:manage")
    public ResponseEntity<ServiceCategoryResponse> createCategory(@Valid @RequestBody ServiceCategoryRequest request) {
        log.info("POST /api/v1/service-categories: Creating new service category");
        return new ResponseEntity<>(serviceCategoryService.createCategory(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update service category")
    @HasPermission("service:manage")
    public ResponseEntity<ServiceCategoryResponse> updateCategory(
            @PathVariable UUID id,
            @Valid @RequestBody ServiceCategoryRequest request) {
        log.info("PUT /api/v1/service-categories/{}: Updating service category", id);
        return ResponseEntity.ok(serviceCategoryService.updateCategory(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete service category")
    @HasPermission("service:manage")
    public ResponseEntity<Void> deleteCategory(@PathVariable UUID id) {
        log.info("DELETE /api/v1/service-categories/{}: Deleting service category", id);
        serviceCategoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
} 