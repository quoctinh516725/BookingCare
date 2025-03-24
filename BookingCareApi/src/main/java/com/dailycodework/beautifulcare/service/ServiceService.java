package com.dailycodework.beautifulcare.service;

import com.dailycodework.beautifulcare.dto.request.ServiceCreateRequest;
import com.dailycodework.beautifulcare.dto.request.ServiceUpdateRequest;
import com.dailycodework.beautifulcare.dto.response.ServiceResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ServiceService {
    ServiceResponse createService(ServiceCreateRequest request);

    ServiceResponse getServiceById(String id);

    ServiceResponse getServiceByName(String name);

    Page<ServiceResponse> getAllServices(Pageable pageable);

    List<ServiceResponse> getServicesByCategoryId(String categoryId);

    ServiceResponse updateService(String id, ServiceUpdateRequest request);

    void deleteService(String id);

    List<ServiceResponse> searchServices(String keyword);

    boolean existsByName(String name);
}