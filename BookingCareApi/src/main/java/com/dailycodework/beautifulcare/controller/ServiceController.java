package com.dailycodework.beautifulcare.controller;

import com.dailycodework.beautifulcare.dto.request.ServiceRequest;
import com.dailycodework.beautifulcare.dto.response.ServiceResponse;
import com.dailycodework.beautifulcare.dto.response.ImageUploadResponse;
import com.dailycodework.beautifulcare.security.HasPermission;
import com.dailycodework.beautifulcare.service.ServiceService;
import com.dailycodework.beautifulcare.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/services")
@RequiredArgsConstructor
@Tag(name = "Service", description = "Service management APIs")
@Slf4j
public class ServiceController {

    private final ServiceService serviceService;
    private final FileStorageService fileStorageService;

    @GetMapping
    @Operation(summary = "Get all services")
    public ResponseEntity<List<ServiceResponse>> getAllServices(
            @RequestParam(required = false) UUID categoryId) {
        if (categoryId != null) {
            log.info("GET /api/v1/services?categoryId={}: Retrieving services by category", categoryId);
            return ResponseEntity.ok(serviceService.getServicesByCategory(categoryId));
        } else {
            log.info("GET /api/v1/services: Retrieving all services");
            return ResponseEntity.ok(serviceService.getAllServices());
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get service by ID")
    public ResponseEntity<ServiceResponse> getServiceById(@PathVariable UUID id) {
        log.info("GET /api/v1/services/{}: Retrieving service details", id);
        return ResponseEntity.ok(serviceService.getServiceById(id));
    }

    @PostMapping
    @Operation(summary = "Create new service")
    @HasPermission("service:create")
    public ResponseEntity<ServiceResponse> createService(@Valid @RequestBody ServiceRequest request) {
        log.info("POST /api/v1/services: Creating new service");
        return ResponseEntity.ok(serviceService.createService(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update service")
    @HasPermission("service:update")
    public ResponseEntity<ServiceResponse> updateService(
            @PathVariable UUID id,
            @Valid @RequestBody ServiceRequest request) {
        log.info("PUT /api/v1/services/{}: Updating service", id);
        return ResponseEntity.ok(serviceService.updateService(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete service")
    @HasPermission("service:delete")
    public ResponseEntity<Void> deleteService(@PathVariable UUID id) {
        log.info("DELETE /api/v1/services/{}: Deleting service", id);
        serviceService.deleteService(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/upload-image")
    @Operation(summary = "Upload service image", 
               description = "Upload an image for a service and returns the image URL")
    @HasPermission("service:create")
    public ResponseEntity<ImageUploadResponse> uploadServiceImage(
            @RequestParam("file") MultipartFile file) {
        log.info("POST /api/v1/services/upload-image: Uploading service image");
        
        String fileName = fileStorageService.storeFile(file);
        String fileUrl = fileStorageService.getFileUrl(fileName);
        
        log.info("Service image uploaded successfully: {}", fileName);
        
        ImageUploadResponse response = new ImageUploadResponse(
                fileName, 
                fileUrl, 
                "Service image uploaded successfully");
        
        return ResponseEntity.ok(response);
    }
}