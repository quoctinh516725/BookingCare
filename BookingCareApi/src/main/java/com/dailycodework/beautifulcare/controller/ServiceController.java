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
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.HashMap;
import java.util.Map;

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
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "imageUrl", required = false) String imageUrl) {
        
        // Kiểm tra xem có ít nhất một trong hai tham số hay không
        if (file == null && (imageUrl == null || imageUrl.isEmpty())) {
            return ResponseEntity.badRequest().body(
                new ImageUploadResponse(
                    null, 
                    null, 
                    "Either file or imageUrl parameter is required"
                )
            );
        }
        
        // Ưu tiên file upload nếu cả hai tham số đều được cung cấp
        if (file != null && !file.isEmpty()) {
            log.info("POST /api/v1/services/upload-image: Uploading service image file");
            
            String fileName = fileStorageService.storeFile(file);
            String fileUrl = fileStorageService.getFileUrl(fileName);
            
            log.info("Service image uploaded successfully: {}", fileName);
            
            return ResponseEntity.ok(new ImageUploadResponse(
                    fileName, 
                    fileUrl, 
                    "Service image uploaded successfully"));
        } else {
            // Xử lý URL ảnh bên ngoài
            log.info("POST /api/v1/services/upload-image: Using external image URL: {}", imageUrl);
            
            return ResponseEntity.ok(new ImageUploadResponse(
                    null, 
                    imageUrl, 
                    "External image URL saved successfully"));
        }
    }
    
    @GetMapping("/check-image")
    @Operation(summary = "Check if an image exists",
               description = "Checks if an image exists and returns status")
    public ResponseEntity<Map<String, Object>> checkImageExists(
            @RequestParam("imageUrl") String imageUrl) {
        
        log.info("GET /api/v1/services/check-image: Checking image: {}", imageUrl);
        
        Map<String, Object> response = new HashMap<>();
        // Nếu là URL nội bộ, kiểm tra file có tồn tại không
        if (imageUrl.startsWith("/api/v1/upload/files/")) {
            String fileName = imageUrl.substring("/api/v1/upload/files/".length());
            try {
                Resource resource = fileStorageService.loadFileAsResource(fileName);
                boolean exists = resource.exists() && !resource.getFilename().equals("default-image.png");
                
                response.put("exists", exists);
                response.put("imageUrl", exists ? imageUrl : "/api/v1/upload/files/default-image.png");
                response.put("message", exists ? "Image exists" : "Image does not exist, using default");
                
                return ResponseEntity.ok(response);
            } catch (Exception e) {
                response.put("exists", false);
                response.put("imageUrl", "/api/v1/upload/files/default-image.png");
                response.put("message", "Error checking image, using default");
                
                return ResponseEntity.ok(response);
            }
        } else {
            // URL bên ngoài, giả định là tồn tại
            response.put("exists", true);
            response.put("imageUrl", imageUrl);
            response.put("message", "External URL assumed valid");
            
            return ResponseEntity.ok(response);
        }
    }
}