package com.dailycodework.beautifulcare.mapper;

import com.dailycodework.beautifulcare.dto.request.ServiceCreateRequest;
import com.dailycodework.beautifulcare.dto.request.ServiceUpdateRequest;
import com.dailycodework.beautifulcare.dto.response.ServiceResponse;
import com.dailycodework.beautifulcare.entity.Service;
import com.dailycodework.beautifulcare.entity.ServiceCategory;
import org.springframework.stereotype.Component;

import java.util.List;

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
@Component
public interface ServiceMapper {

    /**
     * Maps a Service entity to a ServiceResponse DTO.
     * This method should convert all relevant data from the entity to the response
     * DTO.
     *
     * @param service the service entity to map
     * @return the mapped service response DTO
     */
    ServiceResponse toServiceResponse(Service service);

    /**
     * Maps a ServiceCreateRequest DTO to a Service entity.
     * This method should create a new Service entity populated with data from the
     * request DTO.
     *
     * @param request  the service create request DTO
     * @param category the service category entity
     * @return the mapped service entity
     */
    Service toService(ServiceCreateRequest request, ServiceCategory category);

    /**
     * Updates a Service entity with values from a ServiceUpdateRequest DTO.
     * This method should update only the fields that are specified in the request.
     *
     * @param service  the service entity to update
     * @param request  the service update request DTO
     * @param category the service category entity
     * @return the updated service entity
     */
    Service updateService(Service service, ServiceUpdateRequest request, ServiceCategory category);

    /**
     * Converts a list of Service entities to a list of ServiceResponse DTOs.
     * This method should apply the toServiceResponse method to each entity in the
     * list.
     *
     * @param services the list of service entities
     * @return the list of service response DTOs
     */
    List<ServiceResponse> toServiceResponseList(List<Service> services);
}