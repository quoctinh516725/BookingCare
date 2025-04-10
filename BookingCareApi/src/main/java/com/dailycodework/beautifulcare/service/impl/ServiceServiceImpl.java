package com.dailycodework.beautifulcare.service.impl;

import com.dailycodework.beautifulcare.dto.request.ServiceRequest;
import com.dailycodework.beautifulcare.dto.response.ServiceResponse;
import com.dailycodework.beautifulcare.entity.Service;
import com.dailycodework.beautifulcare.entity.ServiceCategory;
import com.dailycodework.beautifulcare.exception.DuplicateResourceException;
import com.dailycodework.beautifulcare.exception.ResourceNotFoundException;
import com.dailycodework.beautifulcare.mapper.ServiceMapper;
import com.dailycodework.beautifulcare.repository.ServiceCategoryRepository;
import com.dailycodework.beautifulcare.repository.ServiceRepository;
import com.dailycodework.beautifulcare.service.ServiceService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Base64;
import org.springframework.web.multipart.MultipartFile;
import com.dailycodework.beautifulcare.service.FileStorageService;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import com.dailycodework.beautifulcare.exception.FileStorageException;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Slf4j
public class ServiceServiceImpl implements ServiceService {

    private final ServiceRepository serviceRepository;
    private final ServiceCategoryRepository serviceCategoryRepository;
    private final ServiceMapper serviceMapper;
    private final FileStorageService fileStorageService;

    @Override
    public List<ServiceResponse> getAllServices() {
        log.info("Fetching all services");
        return serviceRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ServiceResponse getServiceById(UUID id) {
        log.info("Fetching service with id: {}", id);
        return serviceRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new EntityNotFoundException("Service not found with id: " + id));
    }

    @Override
    @Transactional
    public ServiceResponse createService(ServiceRequest request) {
        log.info("Creating new service: {}", request.getName());
        
        // Kiểm tra thông tin
        if (serviceRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Service name already exists");
        }
        
        // Xử lý URL ảnh - giữ nguyên URL bất kể nguồn
        String imageUrl = request.getImage();
        if (imageUrl != null) {
            log.info("Using image URL: {}", imageUrl);
        } else {
            // Sử dụng ảnh mặc định nếu không có
            imageUrl = "/api/v1/upload/files/default-image.png";
            log.info("No image provided, using default image");
        }
        
        // Tạo service mới
        Service service = new Service();
        service.setName(request.getName());
        service.setDescription(request.getDescription());
        service.setPrice(request.getPrice());
        service.setDuration(request.getDuration());
        service.setImageUrl(imageUrl);
        service.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        
        // Thêm danh mục nếu được cung cấp
        if (request.getCategoryId() != null) {
            ServiceCategory category = serviceCategoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));
            service.setCategory(category);
        }
        
        service = serviceRepository.save(service);
        log.info("Service created successfully with id: {}", service.getId());
        
        return mapToResponse(service);
    }

    @Override
    @Transactional
    public ServiceResponse updateService(UUID id, ServiceRequest request) {
        log.info("Updating service with id: {}", id);
        
        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Service not found with id: " + id));

        service.setName(request.getName());
        service.setDescription(request.getDescription());
        service.setPrice(request.getPrice());
        service.setDuration(request.getDuration());
        
        // Xử lý URL ảnh - giữ nguyên URL gốc nếu không có URL mới
        String imageUrl = request.getImage();
        if (imageUrl != null) {
            log.info("Updating image URL: {}", imageUrl);
            service.setImageUrl(imageUrl);
        }
        
        service.setIsActive(request.getIsActive());
        
        // Update category if provided
        if (request.getCategoryId() != null) {
            ServiceCategory category = serviceCategoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));
            service.setCategory(category);
        } else {
            service.setCategory(null);
        }

        service = serviceRepository.save(service);
        log.info("Service updated successfully with id: {}", service.getId());
        
        return mapToResponse(service);
    }

    @Override
    @Transactional
    public void deleteService(UUID id) {
        log.info("Deleting service with id: {}", id);
        
        if (!serviceRepository.existsById(id)) {
            throw new EntityNotFoundException("Service not found with id: " + id);
        }
        serviceRepository.deleteById(id);
        log.info("Service deleted successfully with id: {}", id);
    }

    @Override
    public List<ServiceResponse> getServicesByCategory(UUID categoryId) {
        log.info("Fetching services by category id: {}", categoryId);
        
        ServiceCategory category = serviceCategoryRepository.findByIdWithServices(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));
        
        return category.getServices().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ServiceResponse mapToResponse(Service service) {
        ServiceResponse response = ServiceResponse.builder()
                .id(service.getId())
                .name(service.getName())
                .description(service.getDescription())
                .price(service.getPrice())
                .duration(service.getDuration())
                .image(service.getImageUrl())
                .isActive(service.getIsActive())
                .createdAt(service.getCreatedAt())
                .updatedAt(service.getUpdatedAt())
                .build();
                
        // Add category information if available
        if (service.getCategory() != null) {
            response.setCategoryId(service.getCategory().getId());
            response.setCategoryName(service.getCategory().getName());
            response.setCategoryCode(service.getCategory().getCode());
        }
        
        return response;
    }

    /**
     * Kiểm tra xem một chuỗi có phải là URL hợp lệ hay không
     * @param url Chuỗi cần kiểm tra
     * @return true nếu là URL hợp lệ, false nếu không
     */
    private boolean isValidUrl(String url) {
        return url != null && (url.startsWith("http://") || url.startsWith("https://"));
    }
    
    /**
     * Kiểm tra xem một chuỗi có phải là ảnh base64 hay không
     * @param data Chuỗi cần kiểm tra
     * @return true nếu là ảnh base64, false nếu không
     */
    private boolean isBase64Image(String data) {
        return data != null && 
              (data.startsWith("data:image/jpeg;base64,") || 
               data.startsWith("data:image/png;base64,") || 
               data.startsWith("data:image/gif;base64,") ||
               data.startsWith("data:image/webp;base64,"));
    }
    
    /**
     * Chuyển đổi ảnh base64 thành file và lưu trữ
     * @param base64Image Chuỗi base64 của ảnh
     * @return URL của ảnh đã lưu trữ
     */
    private String storeBase64Image(String base64Image) {
        try {
            // Xác định định dạng ảnh
            String imageFormat = "png";
            if (base64Image.startsWith("data:image/jpeg;base64,")) {
                imageFormat = "jpeg";
                base64Image = base64Image.substring("data:image/jpeg;base64,".length());
            } else if (base64Image.startsWith("data:image/png;base64,")) {
                imageFormat = "png";
                base64Image = base64Image.substring("data:image/png;base64,".length());
            } else if (base64Image.startsWith("data:image/gif;base64,")) {
                imageFormat = "gif";
                base64Image = base64Image.substring("data:image/gif;base64,".length());
            } else if (base64Image.startsWith("data:image/webp;base64,")) {
                imageFormat = "webp";
                base64Image = base64Image.substring("data:image/webp;base64,".length());
            }
            
            // Giải mã base64
            byte[] imageBytes = Base64.getDecoder().decode(base64Image);
            
            // Tạo tên file
            String fileName = "image_" + UUID.randomUUID() + "." + imageFormat;
            
            // Lưu file trực tiếp
            Path targetLocation = fileStorageService.getFileStorageLocation().resolve(fileName);
            Files.write(targetLocation, imageBytes);
            
            // Trả về URL
            return fileStorageService.getFileUrl(fileName);
            
        } catch (Exception e) {
            log.error("Error storing base64 image", e);
            throw new FileStorageException("Could not store base64 image", e);
        }
    }
}