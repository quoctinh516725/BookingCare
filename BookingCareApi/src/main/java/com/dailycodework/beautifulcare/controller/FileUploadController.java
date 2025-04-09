package com.dailycodework.beautifulcare.controller;

import com.dailycodework.beautifulcare.dto.response.ImageUploadResponse;
import com.dailycodework.beautifulcare.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/upload")
@RequiredArgsConstructor
@Tag(name = "File Upload", description = "APIs để tải lên và truy xuất file")
@Slf4j
public class FileUploadController {

    private final FileStorageService fileStorageService;
    
    @PostMapping("/image")
    @Operation(summary = "Upload một ảnh", description = "Tải một ảnh lên server và trả về URL công khai")
    public ResponseEntity<ImageUploadResponse> uploadImage(@RequestParam("file") MultipartFile file) {
        log.info("Received request to upload image: {}", file.getOriginalFilename());
        
        String fileName = fileStorageService.storeFile(file);
        String fileUrl = fileStorageService.getFileUrl(fileName);
        
        log.info("Image uploaded successfully: {}", fileName);
        
        ImageUploadResponse response = new ImageUploadResponse(fileName, fileUrl, 
                "Image uploaded successfully");
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/images")
    @Operation(summary = "Upload nhiều ảnh", description = "Tải nhiều ảnh lên server và trả về danh sách URL công khai")
    public ResponseEntity<List<ImageUploadResponse>> uploadMultipleImages(
            @RequestParam("files") MultipartFile[] files) {
        log.info("Received request to upload {} images", files.length);
        
        List<ImageUploadResponse> responses = Arrays.stream(files)
                .map(file -> {
                    String fileName = fileStorageService.storeFile(file);
                    String fileUrl = fileStorageService.getFileUrl(fileName);
                    return new ImageUploadResponse(fileName, fileUrl, 
                            "Image uploaded successfully");
                })
                .collect(Collectors.toList());
        
        log.info("{} images uploaded successfully", responses.size());
        
        return ResponseEntity.ok(responses);
    }
    
    @GetMapping("/files/{fileName:.+}")
    @Operation(summary = "Tải file", description = "Tải xuống file từ server theo tên file")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable String fileName, HttpServletRequest request) {
        log.info("Received request to download file: {}", fileName);
        
        // Tải file như một resource
        Resource resource = fileStorageService.loadFileAsResource(fileName);
        
        // Xác định loại nội dung (content type)
        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException ex) {
            log.warn("Could not determine file type.");
        }
        
        // Fallback to a default content type if type could not be determined
        if (contentType == null) {
            contentType = "application/octet-stream";
        }
        
        log.info("File {} downloaded successfully", fileName);
        
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
} 