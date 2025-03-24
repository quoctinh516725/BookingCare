package com.dailycodework.beautifulcare.mapper;

import com.dailycodework.beautifulcare.dto.request.ServiceCategoryCreateRequest;
import com.dailycodework.beautifulcare.dto.request.ServiceCategoryUpdateRequest;
import com.dailycodework.beautifulcare.dto.response.ServiceCategoryResponse;
import com.dailycodework.beautifulcare.entity.ServiceCategory;

/**
 * Mapper interface for ServiceCategory entity.
 * Implementation is provided by ServiceCategoryMapperImpl.
 */
public interface ServiceCategoryMapper {

    /**
     * Maps a ServiceCategoryCreateRequest DTO to a ServiceCategory entity.
     *
     * @param request the service category create request DTO
     * @return the mapped service category entity
     */
    ServiceCategory toEntity(ServiceCategoryCreateRequest request);

    /**
     * Maps a ServiceCategory entity to a ServiceCategoryResponse DTO.
     *
     * @param category the service category entity to map
     * @return the mapped service category response DTO
     */
    ServiceCategoryResponse toResponse(ServiceCategory category);

    /**
     * Updates a ServiceCategory entity with values from a
     * ServiceCategoryUpdateRequest DTO.
     *
     * @param category the service category entity to update
     * @param request  the service category update request DTO
     */
    void updateEntity(ServiceCategory category, ServiceCategoryUpdateRequest request);
}