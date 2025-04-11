package com.dailycodework.beautifulcare.controller;

import com.dailycodework.beautifulcare.dto.SpecialistDTO;
import com.dailycodework.beautifulcare.dto.SpecialistRequest;
import com.dailycodework.beautifulcare.dto.response.ImageUploadResponse;
import com.dailycodework.beautifulcare.entity.SpecialistStatus;
import com.dailycodework.beautifulcare.service.FileStorageService;
import com.dailycodework.beautifulcare.service.SpecialistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/specialists")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Specialists", description = "API cho quản lý chuyên gia")
public class SpecialistController {

    private final SpecialistService specialistService;
    private final FileStorageService fileStorageService;

    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả chuyên gia")
    public ResponseEntity<List<SpecialistDTO>> getAllSpecialists() {
        return ResponseEntity.ok(specialistService.getAllSpecialists());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông tin chuyên gia theo ID")
    public ResponseEntity<SpecialistDTO> getSpecialistById(@PathVariable UUID id) {
        return ResponseEntity.ok(specialistService.getSpecialistById(id));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Lấy thông tin chuyên gia theo User ID")
    public ResponseEntity<SpecialistDTO> getSpecialistByUserId(@PathVariable UUID userId) {
        return ResponseEntity.ok(specialistService.getSpecialistByUserId(userId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạo mới chuyên gia")
    public ResponseEntity<SpecialistDTO> createSpecialist(@Valid @RequestBody SpecialistRequest request) {
        return new ResponseEntity<>(specialistService.createSpecialist(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật thông tin chuyên gia")
    public ResponseEntity<SpecialistDTO> updateSpecialist(
            @PathVariable UUID id,
            @Valid @RequestBody SpecialistRequest request) {
        return ResponseEntity.ok(specialistService.updateSpecialist(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xóa chuyên gia")
    public ResponseEntity<Void> deleteSpecialist(@PathVariable UUID id) {
        specialistService.deleteSpecialist(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    @Operation(summary = "Tìm kiếm chuyên gia theo từ khóa")
    public ResponseEntity<List<SpecialistDTO>> searchSpecialists(@RequestParam String query) {
        return ResponseEntity.ok(specialistService.searchSpecialists(query));
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Lấy danh sách chuyên gia theo trạng thái")
    public ResponseEntity<List<SpecialistDTO>> getSpecialistsByStatus(
            @PathVariable SpecialistStatus status) {
        return ResponseEntity.ok(specialistService.getSpecialistsByStatus(status));
    }

    @GetMapping("/specialty/{specialty}")
    @Operation(summary = "Lấy danh sách chuyên gia theo chuyên môn")
    public ResponseEntity<List<SpecialistDTO>> getSpecialistsBySpecialty(
            @PathVariable String specialty) {
        return ResponseEntity.ok(specialistService.getSpecialistsBySpecialty(specialty));
    }

    @GetMapping("/top-rated")
    @Operation(summary = "Lấy danh sách chuyên gia có xếp hạng cao nhất")
    public ResponseEntity<List<SpecialistDTO>> getTopRatedSpecialists(
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(specialistService.getTopRatedSpecialists(limit));
    }

    @GetMapping("/check/{userId}")
    @Operation(summary = "Kiểm tra một user có phải là chuyên gia không")
    public ResponseEntity<Boolean> isUserSpecialist(@PathVariable UUID userId) {
        return ResponseEntity.ok(specialistService.isUserSpecialist(userId));
    }
    
    @PostMapping(value = "/upload-avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Upload ảnh đại diện cho chuyên gia",
            description = "Upload ảnh đại diện cho chuyên gia và trả về URL của ảnh")
    public ResponseEntity<ImageUploadResponse> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) UUID specialistId) {
        
        log.info("Uploading avatar for specialist: {}", specialistId);
        
        String fileName = fileStorageService.storeFile(file);
        String fileUrl = fileStorageService.getFileUrl(fileName);
        
        // Nếu có specialistId, cập nhật avatar cho chuyên gia
        if (specialistId != null) {
            specialistService.updateSpecialistAvatar(specialistId, fileUrl);
        }
        
        log.info("Avatar uploaded successfully: {}", fileName);
        
        return ResponseEntity.ok(new ImageUploadResponse(fileName, fileUrl, "Avatar uploaded successfully"));
    }
    
    @PostMapping(value = "/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Upload ảnh bổ sung cho chuyên gia",
            description = "Upload ảnh bổ sung cho chuyên gia và trả về URL của ảnh")
    public ResponseEntity<ImageUploadResponse> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam UUID specialistId) {
        
        log.info("Uploading additional image for specialist: {}", specialistId);
        
        String fileName = fileStorageService.storeFile(file);
        String fileUrl = fileStorageService.getFileUrl(fileName);
        
        // Thêm ảnh vào danh sách ảnh của chuyên gia
        specialistService.addSpecialistImage(specialistId, fileUrl);
        
        log.info("Image uploaded successfully: {}", fileName);
        
        return ResponseEntity.ok(new ImageUploadResponse(fileName, fileUrl, "Image uploaded successfully"));
    }
    
    @DeleteMapping("/images/{specialistId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xóa ảnh của chuyên gia",
            description = "Xóa một ảnh từ danh sách ảnh của chuyên gia")
    public ResponseEntity<Map<String, String>> deleteSpecialistImage(
            @PathVariable UUID specialistId,
            @RequestParam String imageUrl) {
        
        log.info("Deleting image {} for specialist: {}", imageUrl, specialistId);
        
        boolean deleted = specialistService.removeSpecialistImage(specialistId, imageUrl);
        
        Map<String, String> response = new HashMap<>();
        if (deleted) {
            response.put("message", "Image deleted successfully");
            return ResponseEntity.ok(response);
        } else {
            response.put("message", "Failed to delete image or image not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
} 