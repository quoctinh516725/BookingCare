package com.dailycodework.beautifulcare.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;

public interface FileStorageService {
    /**
     * Lưu trữ file và trả về tên file đã lưu
     * @param file File cần lưu trữ
     * @return Tên file đã lưu
     */
    String storeFile(MultipartFile file);
    
    /**
     * Lưu trữ file với tên được chỉ định
     * @param file File cần lưu trữ
     * @param fileName Tên file chỉ định
     * @return Tên file đã lưu
     */
    String storeFile(MultipartFile file, String fileName);
    
    /**
     * Tải file dưới dạng resource
     * @param fileName Tên file cần tải
     * @return Resource chứa nội dung file
     */
    Resource loadFileAsResource(String fileName);
    
    /**
     * Lấy đường dẫn đến thư mục chứa file
     * @return Path đến thư mục chứa file
     */
    Path getFileStorageLocation();
    
    /**
     * Tạo URL công khai cho file
     * @param fileName Tên file
     * @return URL có thể truy cập từ bên ngoài
     */
    String getFileUrl(String fileName);
} 