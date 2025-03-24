package com.dailycodework.beautifulcare.mapper;

import com.dailycodework.beautifulcare.dto.request.ServiceCreateRequest;
import com.dailycodework.beautifulcare.dto.request.ServiceUpdateRequest;
import com.dailycodework.beautifulcare.dto.response.ServiceResponse;
import com.dailycodework.beautifulcare.entity.Service;
import com.dailycodework.beautifulcare.entity.ServiceCategory;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of the ServiceMapper interface.
 * This class is responsible for converting between Service entities and DTOs.
 * It implements all the mapping methods defined in the ServiceMapper interface.
 * 
 * @author Beautiful Care API Team
 * @version 1.0
 * @since 2025-03-21
 */
@Component
public class ServiceMapperImpl implements ServiceMapper {

    /**
     * Converts a Service entity to a ServiceResponse DTO.
     * This method maps all relevant fields from the entity to the DTO.
     *
     * @param service The Service entity to convert, may be null
     * @return A ServiceResponse DTO containing the mapped data, or null if input is
     *         null
     */
    @Override
    public ServiceResponse toServiceResponse(Service service) {
        if (service == null) {
            return null;
        }

        ServiceResponse response = new ServiceResponse();
        response.setId(service.getId());
        response.setName(service.getName());
        response.setDescription(service.getDescription());
        response.setPrice(service.getPrice());
        response.setDurationMinutes(service.getDuration());

        if (service.getCategory() != null) {
            response.setCategoryId(service.getCategory().getId());
            response.setCategoryName(service.getCategory().getName());
        }

        response.setCreatedAt(service.getCreatedAt());
        response.setUpdatedAt(service.getUpdatedAt());

        return response;
    }

    /**
     * Converts a ServiceCreateRequest DTO to a Service entity.
     * This method creates a new Service entity and populates it with data from the
     * request.
     *
     * @param request  The ServiceCreateRequest containing the data to map, may be
     *                 null
     * @param category The ServiceCategory entity to associate with the service
     * @return A new Service entity with data from the request, or null if input is
     *         null
     */
    @Override
    public Service toService(ServiceCreateRequest request, ServiceCategory category) {
        if (request == null) {
            return null;
        }

        Service service = new Service();
        service.setName(request.getName());
        service.setDescription(request.getDescription());
        service.setPrice(request.getPrice());
        service.setDuration(request.getDuration());
        service.setCategory(category);

        return service;
    }

    /**
     * Updates an existing Service entity with data from a ServiceUpdateRequest DTO.
     * This method only updates fields that are not null in the request.
     *
     * @param service  The Service entity to update, may be null
     * @param request  The ServiceUpdateRequest containing update data, may be null
     * @param category The ServiceCategory entity to associate with the service, may
     *                 be null
     * @return The updated Service entity, or the original entity if input is null
     */
    @Override
    public Service updateService(Service service, ServiceUpdateRequest request, ServiceCategory category) {
        if (service == null || request == null) {
            return service;
        }

        if (request.getName() != null) {
            service.setName(request.getName());
        }

        if (request.getDescription() != null) {
            service.setDescription(request.getDescription());
        }

        if (request.getPrice() != null) {
            service.setPrice(request.getPrice());
        }

        if (request.getDuration() != null) {
            service.setDuration(request.getDuration());
        }

        if (category != null) {
            service.setCategory(category);
        }

        return service;
    }

    /**
     * Converts a list of Service entities to a list of ServiceResponse DTOs.
     * This method applies the toServiceResponse method to each entity in the list.
     *
     * @param services The list of Service entities to convert, may be null
     * @return A list of ServiceResponse DTOs, or an empty list if input is null
     */
    @Override
    public List<ServiceResponse> toServiceResponseList(List<Service> services) {
        if (services == null) {
            return new ArrayList<>();
        }

        return services.stream()
                .map(this::toServiceResponse)
                .collect(Collectors.toList());
    }
}