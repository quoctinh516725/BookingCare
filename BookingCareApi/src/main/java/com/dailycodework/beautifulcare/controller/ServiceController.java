package com.dailycodework.beautifulcare.controller;

import com.dailycodework.beautifulcare.dto.request.ServiceCreateRequest;
import com.dailycodework.beautifulcare.dto.request.ServiceUpdateRequest;
import com.dailycodework.beautifulcare.dto.response.ApiResponse;
import com.dailycodework.beautifulcare.dto.response.ServiceResponse;
import com.dailycodework.beautifulcare.service.ServiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/services")
@RequiredArgsConstructor
@Slf4j
public class ServiceController {

    private final ServiceService serviceService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<ServiceResponse>> createService(
            @Valid @RequestBody ServiceCreateRequest request) {
        log.info("REST request to create a new service");
        ServiceResponse response = serviceService.createService(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Service created successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ServiceResponse>> getServiceById(@PathVariable String id) {
        log.info("REST request to get service by id: {}", id);
        ServiceResponse response = serviceService.getServiceById(id);
        return ResponseEntity.ok(ApiResponse.success("Service retrieved successfully", response));
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<ApiResponse<ServiceResponse>> getServiceByName(@PathVariable String name) {
        log.info("REST request to get service by name: {}", name);
        ServiceResponse response = serviceService.getServiceByName(name);
        return ResponseEntity.ok(ApiResponse.success("Service retrieved successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ServiceResponse>>> getAllServices(
            @PageableDefault(size = 10, sort = "name") Pageable pageable) {
        log.info("REST request to get all services with pagination");
        Page<ServiceResponse> responses = serviceService.getAllServices(pageable);
        return ResponseEntity.ok(ApiResponse.success("Services retrieved successfully", responses));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<List<ServiceResponse>>> getServicesByCategoryId(@PathVariable String categoryId) {
        log.info("REST request to get services by category id: {}", categoryId);
        List<ServiceResponse> responses = serviceService.getServicesByCategoryId(categoryId);
        return ResponseEntity.ok(ApiResponse.success("Services for category retrieved successfully", responses));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ServiceResponse>> updateService(
            @PathVariable String id,
            @Valid @RequestBody ServiceUpdateRequest request) {
        log.info("REST request to update service with id: {}", id);
        ServiceResponse response = serviceService.updateService(id, request);
        return ResponseEntity.ok(ApiResponse.success("Service updated successfully", response));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteService(@PathVariable String id) {
        log.info("REST request to delete service with id: {}", id);
        serviceService.deleteService(id);
        return ResponseEntity.ok(ApiResponse.success("Service deleted successfully", null));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ServiceResponse>>> searchServices(@RequestParam String keyword) {
        log.info("REST request to search services with keyword: {}", keyword);
        List<ServiceResponse> responses = serviceService.searchServices(keyword);
        return ResponseEntity.ok(ApiResponse.success("Services found successfully", responses));
    }
}