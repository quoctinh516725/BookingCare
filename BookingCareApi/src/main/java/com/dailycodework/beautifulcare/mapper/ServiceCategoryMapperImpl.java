package com.dailycodework.beautifulcare.mapper;

import com.dailycodework.beautifulcare.dto.request.ServiceCategoryCreateRequest;
import com.dailycodework.beautifulcare.dto.request.ServiceCategoryUpdateRequest;
import com.dailycodework.beautifulcare.dto.response.ServiceCategoryResponse;
import com.dailycodework.beautifulcare.entity.ServiceCategory;
import org.springframework.stereotype.Component;

import java.util.ArrayList;

@Component
public class ServiceCategoryMapperImpl implements ServiceCategoryMapper {

    @Override
    public ServiceCategory toEntity(ServiceCategoryCreateRequest request) {
        if (request == null) {
            return null;
        }

        ServiceCategory category = new ServiceCategory();
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setServices(new ArrayList<>());

        return category;
    }

    @Override
    public ServiceCategoryResponse toResponse(ServiceCategory category) {
        if (category == null) {
            return null;
        }

        ServiceCategoryResponse response = new ServiceCategoryResponse();
        response.setId(category.getId());
        response.setName(category.getName());
        response.setDescription(category.getDescription());
        response.setCreatedAt(category.getCreatedAt());
        response.setUpdatedAt(category.getUpdatedAt());

        return response;
    }

    @Override
    public void updateEntity(ServiceCategory category, ServiceCategoryUpdateRequest request) {
        if (category == null || request == null) {
            return;
        }

        if (request.getName() != null) {
            category.setName(request.getName());
        }

        if (request.getDescription() != null) {
            category.setDescription(request.getDescription());
        }
    }
}