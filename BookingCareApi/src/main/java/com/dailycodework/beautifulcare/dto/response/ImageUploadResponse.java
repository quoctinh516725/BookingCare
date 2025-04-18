package com.dailycodework.beautifulcare.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ImageUploadResponse {
    private String fileName;
    private String imageUrl;
    private String message;
    private String webpUrl;
    private boolean webpEnabled;
    
    public ImageUploadResponse(String fileName, String imageUrl, String message) {
        this.fileName = fileName;
        this.imageUrl = imageUrl;
        this.message = message;
        this.webpEnabled = false;
    }
} 