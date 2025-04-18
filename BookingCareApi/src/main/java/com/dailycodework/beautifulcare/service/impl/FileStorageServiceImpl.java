package com.dailycodework.beautifulcare.service.impl;

import com.dailycodework.beautifulcare.config.FileStorageProperties;
import com.dailycodework.beautifulcare.exception.FileStorageException;
import com.dailycodework.beautifulcare.service.FileStorageService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileStorageServiceImpl implements FileStorageService {

    private final FileStorageProperties fileStorageProperties;
    private final HttpServletRequest request;
    
    @Value("${server.servlet.context-path:}")
    private String contextPath;
    
    // Thêm cấu hình cho WebP
    @Value("${file.webp.enabled:true}")
    private boolean webpEnabled;
    
    @Value("${file.webp.quality:0.8}")
    private float webpQuality;
    
    @Value("${file.cache.max-age:604800}")
    private long cacheMaxAge; // 7 days mặc định
    
    private Path fileStorageLocation;
    private Path webpStorageLocation;

    /**
     * Khởi tạo thư mục lưu trữ file nếu chưa tồn tại
     */
    private void init() {
        if (fileStorageLocation == null) {
            try {
                fileStorageLocation = Paths.get(fileStorageProperties.getUploadDir())
                        .toAbsolutePath().normalize();
                Files.createDirectories(fileStorageLocation);
                
                // Khởi tạo thư mục cho WebP
                webpStorageLocation = Paths.get(fileStorageProperties.getUploadDir(), "webp")
                        .toAbsolutePath().normalize();
                Files.createDirectories(webpStorageLocation);
                
                log.info("Initialized file storage location: {}", fileStorageLocation);
                log.info("Initialized WebP storage location: {}", webpStorageLocation);
            } catch (Exception ex) {
                throw new FileStorageException("Could not create the directory where files will be stored.", ex);
            }
        }
    }

    @Override
    public String storeFile(MultipartFile file) {
        init();
        String originalFileName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        String fileExtension = "";
        
        int lastDotIndex = originalFileName.lastIndexOf('.');
        if (lastDotIndex > 0) {
            fileExtension = originalFileName.substring(lastDotIndex);
        }
        
        String fileName = UUID.randomUUID() + fileExtension;
        return storeFile(file, fileName);
    }

    @Override
    public String storeFile(MultipartFile file, String fileName) {
        init();
        try {
            // Kiểm tra tên file hợp lệ
            if (fileName.contains("..")) {
                throw new FileStorageException("Invalid file name: " + fileName);
            }
            
            // Tạo đường dẫn đầy đủ đến file
            Path targetLocation = fileStorageLocation.resolve(fileName);
            
            // Lưu file gốc vào đường dẫn đó
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            
            // Nếu là ảnh, tạo bản sao WebP
            if (webpEnabled && isImage(file.getContentType())) {
                try {
                    createWebPVersion(file, fileName);
                } catch (Exception e) {
                    log.warn("Failed to create WebP version for {}: {}", fileName, e.getMessage());
                }
            }
            
            log.info("File stored successfully: {}", fileName);
            return fileName;
        } catch (IOException ex) {
            throw new FileStorageException("Could not store file " + fileName, ex);
        }
    }
    
    /**
     * Kiểm tra xem file có phải là ảnh không
     */
    private boolean isImage(String contentType) {
        return contentType != null && contentType.startsWith("image/");
    }
    
    /**
     * Tạo phiên bản WebP của ảnh
     */
    private void createWebPVersion(MultipartFile file, String originalFileName) throws IOException {
        try {
            // Đọc ảnh gốc
            BufferedImage originalImage = ImageIO.read(file.getInputStream());
            if (originalImage == null) {
                log.warn("Could not read image: {}", originalFileName);
                return;
            }
            
            // Tên file WebP - thay đổi phần mở rộng thành .webp
            String webpFileName = getWebPFileName(originalFileName);
            Path webpTargetLocation = webpStorageLocation.resolve(webpFileName);
            
            // Tạo WebP sử dụng thư viện org.sejda.imageio
            ByteArrayOutputStream webpOutput = new ByteArrayOutputStream();
            
            // Lưu ý: Cần đảm bảo WebP ImageWriter đã được đăng ký 
            // (thông thường thư viện org.sejda.imageio sẽ tự đăng ký thông qua ServiceLoader)
            boolean success = ImageIO.write(originalImage, "webp", webpOutput);
            
            if (!success) {
                log.warn("No appropriate writer found for WebP format");
                return;
            }
            
            // Lưu file WebP
            Files.write(webpTargetLocation, webpOutput.toByteArray());
            log.info("Created WebP version: {}", webpFileName);
        } catch (Exception e) {
            log.error("Error creating WebP version for {}: {}", originalFileName, e.getMessage());
            throw e;
        }
    }
    
    /**
     * Chuyển đổi tên file thành tên file WebP
     */
    private String getWebPFileName(String originalFileName) {
        int lastDotIndex = originalFileName.lastIndexOf('.');
        if (lastDotIndex > 0) {
            return originalFileName.substring(0, lastDotIndex) + ".webp";
        }
        return originalFileName + ".webp";
    }

    @Override
    public Resource loadFileAsResource(String fileName) {
        init();
        try {
            // Kiểm tra xem khách hàng có hỗ trợ WebP không
            boolean clientSupportsWebp = isWebpSupported();
            
            // Nếu khách hàng hỗ trợ WebP và chức năng WebP được bật, thử tải phiên bản WebP trước
            if (webpEnabled && clientSupportsWebp && isImageFile(fileName)) {
                try {
                    String webpFileName = getWebPFileName(fileName);
                    Path webpFilePath = webpStorageLocation.resolve(webpFileName).normalize();
                    Resource webpResource = new UrlResource(webpFilePath.toUri());
                    
                    if (webpResource.exists()) {
                        log.debug("Serving WebP version: {}", webpFileName);
                        return webpResource;
                    }
                } catch (Exception e) {
                    // Lỗi khi tải WebP, tiếp tục với file gốc
                    log.debug("Error loading WebP version, falling back to original: {}", e.getMessage());
                }
            }
            
            // Tải file gốc
            Path filePath = fileStorageLocation.resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists()) {
                return resource;
            } else {
                log.error("File not found: {}", fileName);
                // Trả về ảnh mặc định thay vì ném ngoại lệ
                Path defaultImagePath = fileStorageLocation.resolve("default-image.png").normalize();
                if (Files.exists(defaultImagePath)) {
                    return new UrlResource(defaultImagePath.toUri());
                } else {
                    // Tạo ảnh mặc định nếu chưa có
                    try {
                        // Tạo thư mục nếu chưa tồn tại
                        Files.createDirectories(fileStorageLocation);
                        
                        // Tạo một ảnh mặc định đơn giản (1x1 pixel trong suốt)
                        byte[] transparentPixel = new byte[] {
                            (byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
                            0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08,
                            0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, (byte) 0xC4, (byte) 0x89, 0x00, 0x00, 0x00,
                            0x0A, 0x49, 0x44, 0x41, 0x54, 0x08, (byte) 0x99, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05,
                            0x00, 0x01, 0x0D, 0x0A, 0x2D, (byte) 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45,
                            0x4E, 0x44, (byte) 0xAE, 0x42, 0x60, (byte) 0x82
                        };
                        Files.write(defaultImagePath, transparentPixel);
                        return new UrlResource(defaultImagePath.toUri());
                    } catch (IOException e) {
                        log.error("Error creating default image", e);
                        throw new FileStorageException("Could not create default image");
                    }
                }
            }
        } catch (MalformedURLException ex) {
            log.error("Error loading file: {}", fileName, ex);
            throw new FileStorageException("File not found: " + fileName, ex);
        }
    }
    
    /**
     * Kiểm tra xem một file có phải là ảnh dựa trên phần mở rộng
     */
    private boolean isImageFile(String fileName) {
        String lowerFileName = fileName.toLowerCase();
        return lowerFileName.endsWith(".jpg") || lowerFileName.endsWith(".jpeg") || 
               lowerFileName.endsWith(".png") || lowerFileName.endsWith(".gif") || 
               lowerFileName.endsWith(".bmp") || lowerFileName.endsWith(".webp");
    }
    
    /**
     * Kiểm tra xem khách hàng có hỗ trợ WebP không
     */
    private boolean isWebpSupported() {
        String acceptHeader = request.getHeader("Accept");
        return acceptHeader != null && acceptHeader.contains("image/webp");
    }

    @Override
    public Path getFileStorageLocation() {
        init();
        return fileStorageLocation;
    }

    @Override
    public String getFileUrl(String fileName) {
        // Tạo URL tuyệt đối để truy cập file
        String baseUrl = ServletUriComponentsBuilder.fromRequestUri(request)
                .replacePath(contextPath)
                .build()
                .toUriString();
        
        // Loại bỏ dấu slash cuối cùng nếu có để tránh double slash
        if (baseUrl.endsWith("/")) {
            baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        }
        
        return baseUrl + "/api/v1/upload/files/" + fileName;
    }
} 