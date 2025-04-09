package com.dailycodework.beautifulcare.service.impl;

import com.dailycodework.beautifulcare.dto.request.ServiceCategoryRequest;
import com.dailycodework.beautifulcare.dto.response.ServiceCategoryResponse;
import com.dailycodework.beautifulcare.dto.response.ServiceResponse;
import com.dailycodework.beautifulcare.entity.ServiceCategory;
import com.dailycodework.beautifulcare.exception.DuplicateResourceException;
import com.dailycodework.beautifulcare.exception.ResourceNotFoundException;
import com.dailycodework.beautifulcare.mapper.ServiceCategoryMapper;
import com.dailycodework.beautifulcare.mapper.ServiceMapper;
import com.dailycodework.beautifulcare.repository.ServiceCategoryRepository;
import com.dailycodework.beautifulcare.service.ServiceCategoryService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ServiceCategoryServiceImpl implements ServiceCategoryService {

    private final ServiceCategoryRepository serviceCategoryRepository;
    private final ServiceCategoryMapper serviceCategoryMapper;
    private final ServiceMapper serviceMapper;

    @Override
    public List<ServiceCategoryResponse> getAllCategories() {
        log.info("Fetching all service categories");
        return serviceCategoryRepository.findAll().stream()
                .map(serviceCategoryMapper::toServiceCategoryResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ServiceCategoryResponse> getActiveCategories() {
        log.info("Fetching active service categories");
        return serviceCategoryRepository.findByIsActiveTrue().stream()
                .map(serviceCategoryMapper::toServiceCategoryResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ServiceCategoryResponse getCategoryById(UUID id) {
        log.info("Fetching service category with id: {}", id);
        ServiceCategory category = findCategoryById(id);
        return serviceCategoryMapper.toServiceCategoryResponse(category);
    }

    @Override
    @Transactional
    public ServiceCategoryResponse createCategory(ServiceCategoryRequest request) {
        log.info("Creating new service category: {}", request.getName());
        
        // Kiểm tra trùng lặp tên và mã
        if (serviceCategoryRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Danh mục với tên này đã tồn tại");
        }
        
        if (serviceCategoryRepository.existsByCode(request.getCode())) {
            throw new DuplicateResourceException("Danh mục với mã này đã tồn tại");
        }
        
        ServiceCategory category = serviceCategoryMapper.toServiceCategory(request);
        category = serviceCategoryRepository.save(category);
        
        log.info("Service category created successfully with id: {}", category.getId());
        return serviceCategoryMapper.toServiceCategoryResponse(category);
    }

    @Override
    @Transactional
    public ServiceCategoryResponse updateCategory(UUID id, ServiceCategoryRequest request) {
        log.info("Updating service category with id: {}", id);
        
        ServiceCategory category = findCategoryById(id);
        
        // Kiểm tra trùng lặp tên và mã (nếu đã thay đổi)
        if (!category.getName().equals(request.getName()) && 
                serviceCategoryRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Danh mục với tên này đã tồn tại");
        }
        
        if (!category.getCode().equals(request.getCode()) && 
                serviceCategoryRepository.existsByCode(request.getCode())) {
            throw new DuplicateResourceException("Danh mục với mã này đã tồn tại");
        }
        
        serviceCategoryMapper.updateServiceCategory(category, request);
        category = serviceCategoryRepository.save(category);
        
        log.info("Service category updated successfully: {}", category.getId());
        return serviceCategoryMapper.toServiceCategoryResponse(category);
    }

    @Override
    @Transactional
    public void deleteCategory(UUID id) {
        log.info("Deleting service category with id: {}", id);
        
        ServiceCategory category = findCategoryById(id);
        
        // Kiểm tra xem có dịch vụ nào thuộc danh mục này không
        if (!category.getServices().isEmpty()) {
            log.warn("Cannot delete category with id: {} as it has associated services", id);
            throw new IllegalStateException("Không thể xóa danh mục đang có dịch vụ. Vui lòng chuyển dịch vụ sang danh mục khác trước.");
        }
        
        serviceCategoryRepository.delete(category);
        log.info("Service category deleted successfully: {}", id);
    }

    @Override
    public List<ServiceResponse> getServicesByCategory(UUID categoryId) {
        log.info("Fetching services for category id: {}", categoryId);
        
        ServiceCategory category = serviceCategoryRepository.findByIdWithServices(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với id: " + categoryId));
        
        return category.getServices().stream()
                .map(serviceMapper::toServiceResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Helper method to find a category by ID
     * @param id Category ID
     * @return ServiceCategory entity
     * @throws ResourceNotFoundException if category not found
     */
    private ServiceCategory findCategoryById(UUID id) {
        return serviceCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với id: " + id));
    }
} 