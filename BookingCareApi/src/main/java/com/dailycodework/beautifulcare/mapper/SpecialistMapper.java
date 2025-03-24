package com.dailycodework.beautifulcare.mapper;

import com.dailycodework.beautifulcare.dto.request.SpecialistCreateRequest;
import com.dailycodework.beautifulcare.dto.request.SpecialistUpdateRequest;
import com.dailycodework.beautifulcare.dto.response.SpecialistDetailResponse;
import com.dailycodework.beautifulcare.dto.response.SpecialistResponse;
import com.dailycodework.beautifulcare.entity.Specialist;
import org.springframework.stereotype.Component;

/**
 * Mapper interface for Specialist entity.
 * This interface defines the contract for mapping between Specialist entities
 * and DTOs.
 * It handles complex mapping scenarios involving nested relationships such as
 * User and Service entities.
 * 
 * @author Beautiful Care API Team
 * @version 1.0
 * @since 2025-03-21
 */
@Component
public interface SpecialistMapper {

    /**
     * Converts a SpecialistCreateRequest DTO to a Specialist entity.
     * This method should create a new Specialist entity with an associated User
     * entity
     * and populate them with data from the request.
     *
     * @param request The request DTO containing specialist creation data
     * @return A new Specialist entity populated with request data
     */
    Specialist toSpecialist(SpecialistCreateRequest request);

    /**
     * Converts a Specialist entity to a SpecialistResponse DTO.
     * This method should extract relevant data from the Specialist entity and its
     * associated User
     * to create a response suitable for list views and summary information.
     *
     * @param specialist The Specialist entity to convert
     * @return A SpecialistResponse DTO containing the specialist's data
     */
    SpecialistResponse toSpecialistResponse(Specialist specialist);

    /**
     * Converts a Specialist entity to a detailed SpecialistDetailResponse DTO.
     * This method should create a comprehensive response containing all specialist
     * information,
     * including user details, services offered, and professional certifications.
     *
     * @param specialist The Specialist entity to convert
     * @return A SpecialistDetailResponse DTO with complete specialist details
     */
    SpecialistDetailResponse toDetailResponse(Specialist specialist);

    /**
     * Updates an existing Specialist entity with data from a
     * SpecialistUpdateRequest DTO.
     * This method should selectively update fields in the Specialist entity and its
     * associated User
     * based on the non-null fields in the request.
     *
     * @param request    The request DTO containing update data
     * @param specialist The Specialist entity to update
     */
    void updateSpecialistFromRequest(SpecialistUpdateRequest request, Specialist specialist);
}