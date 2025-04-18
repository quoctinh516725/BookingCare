package com.dailycodework.beautifulcare.controller;

import com.dailycodework.beautifulcare.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.concurrent.TimeUnit;
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
    
    @Value("${file.cache.max-age:604800}")
    private long cacheMaxAge; // 7 ngày mặc định

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
        
        // Thiết lập cache control
        CacheControl cacheControl = CacheControl.maxAge(cacheMaxAge, TimeUnit.SECONDS)
                                                .cachePublic();
                                                
        // Thiết lập headers bổ sung
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(contentType));
        headers.setCacheControl(cacheControl.getHeaderValue());
        headers.setExpires(System.currentTimeMillis() + TimeUnit.SECONDS.toMillis(cacheMaxAge));
        
        // ETag để hỗ trợ validation caching
        try {
            String etag = Integer.toHexString((int) resource.contentLength() + 
                                              (int) resource.lastModified() + 
                                              resource.getFilename().hashCode());
            headers.setETag("\"" + etag + "\"");
        } catch (IOException e) {
            log.warn("Could not generate ETag for resource: {}", e.getMessage());
        }
        
        // Thiết lập CORS headers
        headers.add("Access-Control-Allow-Origin", "*");
        headers.add("Access-Control-Allow-Methods", "GET, OPTIONS");
        headers.add("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
        headers.add("Access-Control-Max-Age", "3600");
        
        // Vary header để đảm bảo cache dựa trên Accept header (quan trọng cho WebP)
        headers.add("Vary", "Accept");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(resource);
    }
} 