package com.dailycodework.beautifulcare.mapper;

import com.dailycodework.beautifulcare.dto.request.SpecialistCreateRequest;
import com.dailycodework.beautifulcare.dto.request.SpecialistUpdateRequest;
import com.dailycodework.beautifulcare.dto.response.SpecialistDetailResponse;
import com.dailycodework.beautifulcare.dto.response.SpecialistResponse;
import com.dailycodework.beautifulcare.entity.Specialist;
import com.dailycodework.beautifulcare.entity.User;
import com.dailycodework.beautifulcare.entity.UserRole;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of the SpecialistMapper interface.
 * This class is responsible for converting between Specialist entities and
 * DTOs.
 * It handles the complex mapping between entity relationships and DTO fields,
 * particularly for user information and nested objects.
 * 
 * @author Beautiful Care API Team
 * @version 1.0
 * @since 2025-03-21
 */
@Component
public class SpecialistMapperImpl implements SpecialistMapper {

    private final ServiceMapper serviceMapper;

    /**
     * Constructor for SpecialistMapperImpl.
     * 
     * @param serviceMapper The ServiceMapper dependency used for mapping service
     *                      entities
     */
    public SpecialistMapperImpl(ServiceMapper serviceMapper) {
        this.serviceMapper = serviceMapper;
    }

    /**
     * Converts a SpecialistCreateRequest DTO to a Specialist entity.
     * This method creates a new Specialist entity with an associated User entity
     * and populates them with data from the request.
     *
     * @param request The SpecialistCreateRequest containing the data to map, may be
     *                null
     * @return A new Specialist entity with data from the request, or null if input
     *         is null
     */
    @Override
    public Specialist toSpecialist(SpecialistCreateRequest request) {
        if (request == null) {
            return null;
        }

        Specialist specialist = new Specialist();

        // Create and set user information
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setDob(request.getDob());
        user.setRole(UserRole.SPECIALIST);

        specialist.setUser(user);
        specialist.setSpecialization(request.getExpertise());
        specialist.setBio(request.getBio());

        if (request.getYearsOfExperience() > 0) {
            specialist.setExperience(String.valueOf(request.getYearsOfExperience()));
        }

        specialist.setCertification(request.getCertifications());

        return specialist;
    }

    /**
     * Converts a Specialist entity to a SpecialistResponse DTO.
     * This method maps fields from the Specialist entity and its associated User
     * entity
     * to a simplified SpecialistResponse DTO suitable for list views.
     *
     * @param specialist The Specialist entity to convert, may be null
     * @return A SpecialistResponse DTO containing the mapped data, or null if input
     *         is null
     */
    @Override
    public SpecialistResponse toSpecialistResponse(Specialist specialist) {
        if (specialist == null) {
            return null;
        }

        SpecialistResponse response = new SpecialistResponse();
        response.setId(specialist.getId());

        // Map user information if exists
        if (specialist.getUser() != null) {
            User user = specialist.getUser();
            response.setUsername(user.getUsername());
            response.setEmail(user.getEmail());
            response.setFirstName(user.getFirstName());
            response.setLastName(user.getLastName());
            response.setActive(user.isActive());
        }

        response.setExpertise(specialist.getSpecialization());
        response.setBio(specialist.getBio());

        if (specialist.getExperience() != null) {
            try {
                response.setYearsOfExperience(Integer.parseInt(specialist.getExperience()));
            } catch (NumberFormatException e) {
                response.setYearsOfExperience(0);
            }
        }

        return response;
    }

    /**
     * Converts a Specialist entity to a SpecialistDetailResponse DTO.
     * This method creates a detailed response with all specialist information,
     * including user details, services, and certifications.
     *
     * @param specialist The Specialist entity to convert, may be null
     * @return A SpecialistDetailResponse DTO containing the mapped data, or null if
     *         input is null
     */
    @Override
    public SpecialistDetailResponse toDetailResponse(Specialist specialist) {
        if (specialist == null) {
            return null;
        }

        SpecialistDetailResponse response = new SpecialistDetailResponse();
        response.setId(specialist.getId());

        // Map user information if exists
        if (specialist.getUser() != null) {
            User user = specialist.getUser();
            response.setUserId(user.getId());
            response.setUsername(user.getUsername());
            response.setEmail(user.getEmail());
            response.setPhone(user.getPhone());
            response.setFirstName(user.getFirstName());
            response.setLastName(user.getLastName());
            response.setDob(user.getDob());
            response.setAvatar(user.getAvatar());
            response.setActive(user.isActive());
            response.setCreatedAt(user.getCreatedAt());
            response.setUpdatedAt(user.getUpdatedAt());
        }

        response.setBio(specialist.getBio());
        response.setSpecialization(specialist.getSpecialization());
        response.setExpertise(specialist.getSpecialization()); // Using specialization for expertise

        if (specialist.getExperience() != null) {
            try {
                response.setYearsOfExperience(Integer.parseInt(specialist.getExperience()));
            } catch (NumberFormatException e) {
                response.setYearsOfExperience(0);
            }
        }

        // Convert certifications string to list if needed
        if (specialist.getCertification() != null && !specialist.getCertification().isEmpty()) {
            // If certification contains multiple values separated by comma
            String[] certs = specialist.getCertification().split(",");
            response.setCertifications(Arrays.asList(certs));
        } else {
            response.setCertifications(new ArrayList<>());
        }

        // Map services if exists
        if (specialist.getServices() != null) {
            response.setServices(serviceMapper.toServiceResponseList(specialist.getServices()));
        } else {
            response.setServices(new ArrayList<>());
        }

        return response;
    }

    /**
     * Updates an existing Specialist entity with data from a
     * SpecialistUpdateRequest DTO.
     * This method only updates fields that are not null in the request.
     * It handles updating both the Specialist entity and its associated User
     * entity.
     *
     * @param request    The SpecialistUpdateRequest containing the update data, may
     *                   be null
     * @param specialist The Specialist entity to update, may be null
     */
    @Override
    public void updateSpecialistFromRequest(SpecialistUpdateRequest request, Specialist specialist) {
        if (specialist == null || request == null) {
            return;
        }

        // Update user information if exists
        if (specialist.getUser() != null) {
            User user = specialist.getUser();

            if (request.getUsername() != null) {
                user.setUsername(request.getUsername());
            }

            if (request.getEmail() != null) {
                user.setEmail(request.getEmail());
            }

            if (request.getPhone() != null) {
                user.setPhone(request.getPhone());
            }

            if (request.getFirstName() != null) {
                user.setFirstName(request.getFirstName());
            }

            if (request.getLastName() != null) {
                user.setLastName(request.getLastName());
            }

            if (request.getDob() != null) {
                user.setDob(request.getDob());
            }
        }

        if (request.getBio() != null) {
            specialist.setBio(request.getBio());
        }

        if (request.getExpertise() != null) {
            specialist.setSpecialization(request.getExpertise());
        }

        // Check for primitive int type
        Integer yearsOfExperience = request.getYearsOfExperience();
        if (yearsOfExperience != null && yearsOfExperience > 0) {
            specialist.setExperience(String.valueOf(yearsOfExperience));
        }

        if (request.getCertifications() != null) {
            specialist.setCertification(request.getCertifications());
        }
    }
}