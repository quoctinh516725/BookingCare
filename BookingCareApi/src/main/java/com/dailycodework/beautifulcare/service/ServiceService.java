package com.dailycodework.beautifulcare.service;

import com.dailycodework.beautifulcare.dto.request.ServiceRequest;
import com.dailycodework.beautifulcare.dto.response.ServiceResponse;

import java.util.List;
import java.util.UUID;

public interface ServiceService {
    List<ServiceResponse> getAllServices();

    ServiceResponse getServiceById(UUID id);

    ServiceResponse createService(ServiceRequest request);

    ServiceResponse updateService(UUID id, ServiceRequest request);

    void deleteService(UUID id);
}