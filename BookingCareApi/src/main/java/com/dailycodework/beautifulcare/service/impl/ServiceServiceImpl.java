package com.dailycodework.beautifulcare.service.impl;

import com.dailycodework.beautifulcare.dto.request.ServiceCreateRequest;
import com.dailycodework.beautifulcare.dto.request.ServiceUpdateRequest;
import com.dailycodework.beautifulcare.dto.response.ServiceResponse;
import com.dailycodework.beautifulcare.entity.Service;
import com.dailycodework.beautifulcare.entity.ServiceCategory;
import com.dailycodework.beautifulcare.exception.AppException;
import com.dailycodework.beautifulcare.exception.ErrorCode;
import com.dailycodework.beautifulcare.mapper.ServiceMapper;
import com.dailycodework.beautifulcare.repository.ServiceCategoryRepository;
import com.dailycodework.beautifulcare.repository.ServiceRepository;
import com.dailycodework.beautifulcare.service.ServiceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class ServiceServiceImpl implements ServiceService {

    private final ServiceRepository serviceRepository;
    private final ServiceCategoryRepository categoryRepository;
    private final ServiceMapper serviceMapper;

    @Override
    @Transactional
    public ServiceResponse createService(ServiceCreateRequest request) {
        log.info("Creating new service with name: {}", request.getName());
        if (request == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Service create request cannot be null");
        }

        if (serviceRepository.existsByName(request.getName())) {
            log.warn("Service with name {} already exists", request.getName());
            throw new AppException(ErrorCode.SERVICE_ALREADY_EXISTS);
        }

        ServiceCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> {
                    log.error("Category with id {} not found", request.getCategoryId());
                    return new AppException(ErrorCode.SERVICE_CATEGORY_NOT_FOUND);
                });

        try {
            Service service = serviceMapper.toService(request, category);
            Service savedService = serviceRepository.save(service);
            log.info("Service created successfully with id: {}", savedService.getId());
            return serviceMapper.toServiceResponse(savedService);
        } catch (Exception e) {
            log.error("Error creating service: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Error creating service: " + e.getMessage());
        }
    }

    @Override
    public ServiceResponse getServiceById(String id) {
        log.info("Fetching service with id: {}", id);
        if (id == null || id.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Service id cannot be null or empty");
        }

        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Service with id {} not found", id);
                    return new AppException(ErrorCode.SERVICE_NOT_FOUND);
                });

        return serviceMapper.toServiceResponse(service);
    }

    @Override
    public ServiceResponse getServiceByName(String name) {
        log.info("Fetching service with name: {}", name);
        if (name == null || name.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Service name cannot be null or empty");
        }

        Service service = serviceRepository.findByName(name)
                .orElseThrow(() -> {
                    log.error("Service with name {} not found", name);
                    return new AppException(ErrorCode.SERVICE_NOT_FOUND);
                });

        return serviceMapper.toServiceResponse(service);
    }

    @Override
    public Page<ServiceResponse> getAllServices(Pageable pageable) {
        log.info("Fetching all services with pagination");
        if (pageable == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Pageable cannot be null");
        }

        try {
            return serviceRepository.findAll(pageable)
                    .map(serviceMapper::toServiceResponse);
        } catch (Exception e) {
            log.error("Error fetching all services: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Error fetching all services");
        }
    }

    @Override
    public List<ServiceResponse> getServicesByCategoryId(String categoryId) {
        log.info("Fetching services by category id: {}", categoryId);
        if (categoryId == null || categoryId.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Category id cannot be null or empty");
        }

        if (!categoryRepository.existsById(categoryId)) {
            log.error("Category with id {} not found", categoryId);
            throw new AppException(ErrorCode.SERVICE_CATEGORY_NOT_FOUND);
        }

        try {
            List<Service> services = serviceRepository.findByCategoryId(categoryId);
            if (services.isEmpty()) {
                log.info("No services found for category id: {}", categoryId);
                return Collections.emptyList();
            }

            return services.stream()
                    .map(serviceMapper::toServiceResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching services by category id {}: {}", categoryId, e.getMessage(), e);
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Error fetching services by category");
        }
    }

    @Override
    @Transactional
    public ServiceResponse updateService(String id, ServiceUpdateRequest request) {
        log.info("Updating service with id: {}", id);
        if (id == null || id.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Service id cannot be null or empty");
        }

        if (request == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Service update request cannot be null");
        }

        Service service = serviceRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Service with id {} not found for update", id);
                    return new AppException(ErrorCode.SERVICE_NOT_FOUND);
                });

        if (request.getName() != null && !request.getName().equals(service.getName())) {
            if (serviceRepository.existsByName(request.getName())) {
                log.warn("Another service with name {} already exists", request.getName());
                throw new AppException(ErrorCode.SERVICE_ALREADY_EXISTS);
            }
            service.setName(request.getName());
        }

        ServiceCategory category = service.getCategory();
        if (request.getCategoryId() != null && !request.getCategoryId().equals(service.getCategory().getId())) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> {
                        log.error("Category with id {} not found for service update", request.getCategoryId());
                        return new AppException(ErrorCode.SERVICE_CATEGORY_NOT_FOUND);
                    });
        }

        try {
            serviceMapper.updateService(service, request, category);
            Service updatedService = serviceRepository.save(service);
            log.info("Service updated successfully with id: {}", updatedService.getId());
            return serviceMapper.toServiceResponse(updatedService);
        } catch (Exception e) {
            log.error("Error updating service: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Error updating service: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void deleteService(String id) {
        log.info("Deleting service with id: {}", id);
        if (id == null || id.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Service id cannot be null or empty");
        }

        if (!serviceRepository.existsById(id)) {
            log.error("Service with id {} not found for deletion", id);
            throw new AppException(ErrorCode.SERVICE_NOT_FOUND);
        }

        try {
            serviceRepository.deleteById(id);
            log.info("Service deleted successfully with id: {}", id);
        } catch (Exception e) {
            log.error("Error deleting service: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Error deleting service: " + e.getMessage());
        }
    }

    @Override
    public List<ServiceResponse> searchServices(String keyword) {
        log.info("Searching services with keyword: {}", keyword);
        if (keyword == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Search keyword cannot be null");
        }

        try {
            List<Service> services = serviceRepository.findByNameContainingIgnoreCase(keyword);
            if (services.isEmpty()) {
                log.info("No services found matching keyword: {}", keyword);
                return Collections.emptyList();
            }

            return services.stream()
                    .map(serviceMapper::toServiceResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error searching services: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Error searching services: " + e.getMessage());
        }
    }

    @Override
    public boolean existsByName(String name) {
        log.info("Checking if service exists with name: {}", name);
        if (name == null || name.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Service name cannot be null or empty");
        }

        return serviceRepository.existsByName(name);
    }
}