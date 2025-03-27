package com.dailycodework.beautifulcare.mapper;

import com.dailycodework.beautifulcare.dto.request.ServiceRequest;
import com.dailycodework.beautifulcare.dto.response.ServiceResponse;
import com.dailycodework.beautifulcare.entity.Service;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Mapper interface for Service entity.
 * This interface defines the contract for mapping between Service entities and
 * DTOs.
 * It provides methods for converting entities to DTOs and vice versa.
 * 
 * @author Beautiful Care API Team
 * @version 1.0
 * @since 2025-03-21
 */
@Mapper(componentModel = "spring")
public interface ServiceMapper {

    /**
     * Maps a Service entity to a ServiceResponse DTO.
     * This method should convert all relevant data from the entity to the response
     * DTO.
     *
     * @param service the service entity to map
     * @return the mapped service response DTO
     */
    @Mapping(target = "id", source = "id")
    ServiceResponse toServiceResponse(Service service);

    /**
     * Maps a ServiceRequest DTO to a Service entity.
     * This method should create a new Service entity populated with data from the
     * request DTO.
     *
     * @param request the service request DTO
     * @return the mapped service entity
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Service toService(ServiceRequest request);

    /**
     * Updates a Service entity with values from a ServiceRequest DTO.
     * This method should update only the fields that are specified in the request.
     *
     * @param service the service entity to update
     * @param request the service request DTO
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateService(@MappingTarget Service service, ServiceRequest request);

    /**
     * Converts a list of Service entities to a list of ServiceResponse DTOs.
     * This method should apply the toServiceResponse method to each entity in the
     * list.
     *
     * @param services the list of service entities
     * @return the list of service response DTOs
     */
    List<ServiceResponse> toServiceResponses(List<Service> services);
}