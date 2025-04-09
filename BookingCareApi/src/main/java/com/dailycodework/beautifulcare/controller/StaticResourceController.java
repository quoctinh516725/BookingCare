package com.dailycodework.beautifulcare.controller;

import com.dailycodework.beautifulcare.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import jakarta.servlet.http.HttpServletRequest;

/**
 * Controller để truy cập trực tiếp các file tĩnh trong thư mục uploads
 */
@RestController
@RequestMapping("/uploads")
@RequiredArgsConstructor
@Slf4j
public class StaticResourceController {

    private final FileStorageService fileStorageService;

    /**
     * Truy cập file trong thư mục images
     *
     * @param fileName Tên file
     * @param request HttpServletRequest
     * @return Resource chứa nội dung file
     */
    @GetMapping("/images/{fileName:.+}")
    public ResponseEntity<Resource> getImage(@PathVariable String fileName, HttpServletRequest request) {
        log.debug("Request to get image: {}", fileName);
        
        Resource resource = fileStorageService.loadFileAsResource(fileName);
        
        // Xác định loại nội dung
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
        
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
} 