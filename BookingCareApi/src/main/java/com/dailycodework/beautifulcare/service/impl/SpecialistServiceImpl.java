package com.dailycodework.beautifulcare.service.impl;

import com.dailycodework.beautifulcare.dto.request.SpecialistCreateRequest;
import com.dailycodework.beautifulcare.dto.request.SpecialistUpdateRequest;
import com.dailycodework.beautifulcare.dto.response.ServiceResponse;
import com.dailycodework.beautifulcare.dto.response.SpecialistDetailResponse;
import com.dailycodework.beautifulcare.dto.response.SpecialistResponse;
import com.dailycodework.beautifulcare.dto.response.WorkScheduleResponse;
import com.dailycodework.beautifulcare.entity.Service;
import com.dailycodework.beautifulcare.entity.Specialist;
import com.dailycodework.beautifulcare.entity.UserRole;
import com.dailycodework.beautifulcare.exception.AppException;
import com.dailycodework.beautifulcare.exception.ErrorCode;
import com.dailycodework.beautifulcare.exception.ResourceNotFoundException;
import com.dailycodework.beautifulcare.mapper.ServiceMapper;
import com.dailycodework.beautifulcare.mapper.SpecialistMapper;
import com.dailycodework.beautifulcare.mapper.WorkScheduleMapper;
import com.dailycodework.beautifulcare.repository.ServiceRepository;
import com.dailycodework.beautifulcare.repository.SpecialistRepository;
import com.dailycodework.beautifulcare.repository.UserRepository;
import com.dailycodework.beautifulcare.repository.WorkScheduleRepository;
import com.dailycodework.beautifulcare.service.SpecialistService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class SpecialistServiceImpl implements SpecialistService {
    SpecialistRepository specialistRepository;
    ServiceRepository serviceRepository;
    UserRepository userRepository;
    WorkScheduleRepository workScheduleRepository;
    SpecialistMapper specialistMapper;
    ServiceMapper serviceMapper;
    WorkScheduleMapper workScheduleMapper;
    PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public SpecialistResponse createSpecialist(SpecialistCreateRequest request) {
        log.info("Creating new specialist with username: {}", request.getUsername());

        if (request == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Specialist create request cannot be null");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            log.warn("Email {} already exists", request.getEmail());
            throw new AppException(ErrorCode.USER_ALREADY_EXISTS);
        }

        try {
            Specialist specialist = specialistMapper.toSpecialist(request);

            // Set password (should be handled in User entity)
            if (specialist.getUser() != null) {
                specialist.getUser().setPassword(passwordEncoder.encode(request.getPassword()));
                specialist.getUser().setRole(UserRole.SPECIALIST);
            }

            // Add services if provided
            if (request.getServiceIds() != null && !request.getServiceIds().isEmpty()) {
                List<Service> services = new ArrayList<>();
                for (String serviceId : request.getServiceIds()) {
                    Service service = serviceRepository.findById(serviceId)
                            .orElseThrow(() -> {
                                log.error("Service with id {} not found", serviceId);
                                return new AppException(ErrorCode.SERVICE_NOT_FOUND);
                            });
                    services.add(service);
                }
                specialist.setServices(services);
            }

            Specialist savedSpecialist = specialistRepository.save(specialist);
            log.info("Specialist created successfully with id: {}", savedSpecialist.getId());
            return specialistMapper.toSpecialistResponse(savedSpecialist);
        } catch (Exception e) {
            log.error("Error creating specialist: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Error creating specialist: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<SpecialistResponse> getAllSpecialists(Boolean active) {
        log.info("Fetching all specialists with active status: {}", active);
        try {
            List<Specialist> specialists;
            if (active != null) {
                specialists = specialistRepository.findByUserActive(active);
            } else {
                specialists = specialistRepository.findAll();
            }

            return specialists.stream()
                    .map(specialistMapper::toSpecialistResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching specialists: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Error fetching specialists: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public SpecialistDetailResponse getSpecialistById(String id) {
        log.info("Fetching specialist details with id: {}", id);
        if (id == null || id.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Specialist id cannot be null or empty");
        }

        try {
            Specialist specialist = specialistRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Specialist not found with id: " + id));
            return specialistMapper.toDetailResponse(specialist);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error fetching specialist details: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR,
                    "Error fetching specialist details: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public SpecialistDetailResponse getSpecialistByUserId(String userId) {
        log.info("Fetching specialist details by user id: {}", userId);
        if (userId == null || userId.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "User id cannot be null or empty");
        }

        try {
            Specialist specialist = specialistRepository.findByUserId(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Specialist not found with user id: " + userId));
            return specialistMapper.toDetailResponse(specialist);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error fetching specialist by user id: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR,
                    "Error fetching specialist by user id: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<SpecialistResponse> getSpecialistsBySpecialization(String specialization) {
        log.info("Fetching specialists by specialization: {}", specialization);
        if (specialization == null || specialization.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Specialization cannot be null or empty");
        }

        try {
            List<Specialist> specialists = specialistRepository.findBySpecialization(specialization);
            if (specialists.isEmpty()) {
                log.info("No specialists found with specialization: {}", specialization);
                return List.of();
            }

            return specialists.stream()
                    .map(specialistMapper::toSpecialistResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching specialists by specialization: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Error fetching specialists by specialization");
        }
    }

    @Override
    @Transactional
    public SpecialistResponse updateSpecialist(String id, SpecialistUpdateRequest request) {
        log.info("Updating specialist with id: {}", id);
        if (id == null || id.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Specialist id cannot be null or empty");
        }

        if (request == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Specialist update request cannot be null");
        }

        try {
            Specialist specialist = specialistRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Specialist not found with id: " + id));

            // Update specialist fields
            specialistMapper.updateSpecialistFromRequest(request, specialist);

            // Update password if provided
            if (request.getPassword() != null && !request.getPassword().isEmpty() && specialist.getUser() != null) {
                specialist.getUser().setPassword(passwordEncoder.encode(request.getPassword()));
            }

            // Update services if provided
            if (request.getServiceIds() != null && !request.getServiceIds().isEmpty()) {
                List<Service> services = new ArrayList<>();
                for (String serviceId : request.getServiceIds()) {
                    Service service = serviceRepository.findById(serviceId)
                            .orElseThrow(
                                    () -> new ResourceNotFoundException("Service not found with id: " + serviceId));
                    services.add(service);
                }
                specialist.setServices(services);
            }

            Specialist updatedSpecialist = specialistRepository.save(specialist);
            log.info("Specialist updated successfully with id: {}", updatedSpecialist.getId());
            return specialistMapper.toSpecialistResponse(updatedSpecialist);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error updating specialist: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Error updating specialist: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void deleteSpecialist(String id) {
        log.info("Deleting specialist with id: {}", id);
        if (id == null || id.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Specialist id cannot be null or empty");
        }

        try {
            if (!specialistRepository.existsById(id)) {
                throw new ResourceNotFoundException("Specialist not found with id: " + id);
            }
            specialistRepository.deleteById(id);
            log.info("Specialist deleted successfully with id: {}", id);
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error deleting specialist: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Error deleting specialist: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByUserId(String userId) {
        log.info("Checking if specialist exists by user id: {}", userId);
        if (userId == null || userId.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "User id cannot be null or empty");
        }

        return specialistRepository.existsByUserId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WorkScheduleResponse> getSpecialistSchedule(String id) {
        log.info("Fetching schedule for specialist with id: {}", id);
        if (id == null || id.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Specialist id cannot be null or empty");
        }

        // Verify specialist exists
        findSpecialistById(id);

        try {
            return workScheduleRepository.findBySpecialistId(id).stream()
                    .map(workScheduleMapper::toWorkScheduleResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching specialist schedule: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Error fetching specialist schedule");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<SpecialistResponse> getSpecialistsByService(String serviceId) {
        log.info("Fetching specialists by service id: {}", serviceId);
        if (serviceId == null || serviceId.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Service id cannot be null or empty");
        }

        try {
            return specialistRepository.findByServicesId(serviceId).stream()
                    .map(specialistMapper::toSpecialistResponse)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching specialists by service: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Error fetching specialists by service");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ServiceResponse> getSpecialistServices(String specialistId) {
        log.info("Fetching services for specialist with id: {}", specialistId);
        if (specialistId == null || specialistId.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Specialist id cannot be null or empty");
        }

        try {
            Specialist specialist = specialistRepository.findById(specialistId)
                    .orElseThrow(() -> new ResourceNotFoundException("Specialist not found with id: " + specialistId));

            return specialist.getServices().stream()
                    .map(serviceMapper::toServiceResponse)
                    .collect(Collectors.toList());
        } catch (ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error fetching specialist services: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR,
                    "Error fetching specialist services: " + e.getMessage());
        }
    }

    private Specialist findSpecialistById(String id) {
        return specialistRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Specialist with id {} not found", id);
                    return new AppException(ErrorCode.SPECIALIST_NOT_FOUND);
                });
    }
}