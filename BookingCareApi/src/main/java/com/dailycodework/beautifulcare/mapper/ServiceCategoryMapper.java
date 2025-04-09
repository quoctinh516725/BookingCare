package com.dailycodework.beautifulcare.mapper;

import com.dailycodework.beautifulcare.dto.request.ServiceCategoryRequest;
import com.dailycodework.beautifulcare.dto.response.ServiceCategoryResponse;
import com.dailycodework.beautifulcare.entity.ServiceCategory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.springframework.stereotype.Component;

/**
 * Mapper interface for ServiceCategory entity.
 * This interface defines the contract for mapping between ServiceCategory entities and DTOs.
 */
@Component
@Mapper(componentModel = "spring")
public interface ServiceCategoryMapper {

    /**
     * Maps a ServiceCategory entity to a ServiceCategoryResponse DTO.
     *
     * @param category the ServiceCategory entity to map
     * @return the mapped ServiceCategoryResponse DTO
     */
    @Mapping(target = "serviceCount", expression = "java(category.getServices().size())")
    ServiceCategoryResponse toServiceCategoryResponse(ServiceCategory category);

    /**
     * Maps a ServiceCategoryRequest DTO to a ServiceCategory entity.
     *
     * @param request the ServiceCategoryRequest DTO
     * @return the mapped ServiceCategory entity
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "services", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    ServiceCategory toServiceCategory(ServiceCategoryRequest request);

    /**
     * Updates a ServiceCategory entity with values from a ServiceCategoryRequest DTO.
     *
     * @param category the ServiceCategory entity to update
     * @param request the ServiceCategoryRequest DTO
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "services", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateServiceCategory(@MappingTarget ServiceCategory category, ServiceCategoryRequest request);
} 