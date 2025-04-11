package com.dailycodework.beautifulcare.mapper;

import com.dailycodework.beautifulcare.dto.SpecialistDTO;
import com.dailycodework.beautifulcare.dto.SpecialistRequest;
import com.dailycodework.beautifulcare.entity.Specialist;
import com.dailycodework.beautifulcare.entity.User;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Mapper cho Specialist entity và DTO
 */
@Component
public class SpecialistMapper {

    /**
     * Chuyển đổi từ Specialist entity sang DTO
     */
    public SpecialistDTO toDTO(Specialist specialist) {
        if (specialist == null) {
            return null;
        }
        
        User user = specialist.getUser();
        
        return SpecialistDTO.builder()
                .id(specialist.getId())
                .userId(user != null ? user.getId() : null)
                .username(user != null ? user.getUsername() : null)
                .email(user != null ? user.getEmail() : null)
                .firstName(user != null ? user.getFirstName() : null)
                .lastName(user != null ? user.getLastName() : null)
                .phone(user != null ? user.getPhone() : null)
                .specialty(specialist.getSpecialty())
                .qualification(specialist.getQualification())
                .experience(specialist.getExperience())
                .rating(specialist.getRating())
                .avatarUrl(specialist.getAvatarUrl())
                .images(specialist.getImages())
                .workingHours(specialist.getWorkingHours())
                .biography(specialist.getBiography())
                .description(user != null ? user.getDescription() : null)
                .status(specialist.getStatus())
                .build();
    }
    
    /**
     * Cập nhật entity từ SpecialistRequest
     */
    public void updateEntityFromRequest(Specialist specialist, SpecialistRequest request) {
        if (request == null) {
            return;
        }
        
        if (request.getSpecialty() != null) {
            specialist.setSpecialty(request.getSpecialty());
        }
        
        if (request.getQualification() != null) {
            specialist.setQualification(request.getQualification());
        }
        
        if (request.getExperience() != null) {
            specialist.setExperience(request.getExperience());
        }
        
        if (request.getRating() != null) {
            specialist.setRating(request.getRating());
        }
        
        if (request.getAvatarUrl() != null) {
            specialist.setAvatarUrl(request.getAvatarUrl());
        }
        
        if (request.getImages() != null) {
            specialist.setImages(new ArrayList<>(request.getImages()));
        }
        
        if (request.getWorkingHours() != null) {
            specialist.setWorkingHours(request.getWorkingHours());
        }
        
        if (request.getBiography() != null) {
            specialist.setBiography(request.getBiography());
        }
        
        if (request.getStatus() != null) {
            specialist.setStatus(request.getStatus());
        }
    }
    
    /**
     * Tạo entity mới từ SpecialistRequest và User
     */
    public Specialist createEntityFromRequest(SpecialistRequest request, User user) {
        if (request == null) {
            return null;
        }
        
        Specialist specialist = Specialist.builder()
                .user(user)
                .specialty(request.getSpecialty())
                .qualification(request.getQualification())
                .experience(request.getExperience())
                .rating(request.getRating())
                .avatarUrl(request.getAvatarUrl())
                .workingHours(request.getWorkingHours())
                .biography(request.getBiography())
                .status(request.getStatus())
                .build();
                
        if (request.getImages() != null && !request.getImages().isEmpty()) {
            specialist.setImages(new ArrayList<>(request.getImages()));
        }
        
        return specialist;
    }
} 