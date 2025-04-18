package com.dailycodework.beautifulcare;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Class để khởi tạo và đăng ký WebP ImageIO provider khi khởi động ứng dụng
 */
@Component
@Slf4j
public class WebpInitializer {

    @PostConstruct
    public void init() {
        try {
            // Đảm bảo thư viện WebP được load đúng cách
            // org.sejda.imageio.webp.WebpImageReaderSpi và WebpImageWriterSpi 
            // sẽ tự động được đăng ký thông qua file META-INF/services
            
            // Kiểm tra xem WebP ImageIO đã được đăng ký chưa
            boolean webpSupported = javax.imageio.ImageIO.getImageWritersByMIMEType("image/webp").hasNext();
            
            if (webpSupported) {
                log.info("WebP image format is supported");
            } else {
                // Thử load provider theo cách thủ công nếu cần
                log.warn("WebP image format is not supported automatically. Attempting manual registration...");
                
                try {
                    // Load class org.sejda.imageio.webp.WebpImageReaderSpi và WebpImageWriterSpi
                    Class<?> readerSpiClass = Class.forName("org.sejda.imageio.webp.WebpImageReaderSpi");
                    Class<?> writerSpiClass = Class.forName("org.sejda.imageio.webp.WebpImageWriterSpi");
                    
                    // Đăng ký các provider
                    javax.imageio.spi.IIORegistry registry = javax.imageio.spi.IIORegistry.getDefaultInstance();
                    registry.registerServiceProvider(readerSpiClass.newInstance());
                    registry.registerServiceProvider(writerSpiClass.newInstance());
                    
                    log.info("WebP providers registered manually");
                } catch (Exception e) {
                    log.error("Failed to register WebP providers manually: {}", e.getMessage());
                }
                
                // Kiểm tra lại
                webpSupported = javax.imageio.ImageIO.getImageWritersByMIMEType("image/webp").hasNext();
                log.info("WebP support after manual registration: {}", webpSupported);
            }
            
            // Liệt kê các định dạng hình ảnh được hỗ trợ
            String[] formats = javax.imageio.ImageIO.getWriterFormatNames();
            log.info("Supported image formats: {}", String.join(", ", formats));
            
        } catch (Exception e) {
            log.error("Error initializing WebP support: {}", e.getMessage(), e);
        }
    }
} 