package com.dailycodework.beautifulcare.controller;

import com.dailycodework.beautifulcare.dto.request.SpecialistCreateRequest;
import com.dailycodework.beautifulcare.dto.request.SpecialistUpdateRequest;
import com.dailycodework.beautifulcare.dto.response.ApiResponse;
import com.dailycodework.beautifulcare.dto.response.SpecialistResponse;
import com.dailycodework.beautifulcare.dto.response.SpecialistDetailResponse;
import com.dailycodework.beautifulcare.dto.response.WorkScheduleResponse;
import com.dailycodework.beautifulcare.service.SpecialistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/specialists")
@RequiredArgsConstructor
@Slf4j
public class SpecialistController {
    private final SpecialistService specialistService;

    @PostMapping
    public ResponseEntity<ApiResponse<SpecialistResponse>> createSpecialist(
            @Valid @RequestBody SpecialistCreateRequest request) {
        log.info("REST request to create a new specialist");
        SpecialistResponse response = specialistService.createSpecialist(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Specialist created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SpecialistResponse>>> getAllSpecialists() {
        log.info("Fetching all specialists");
        List<SpecialistResponse> specialists = specialistService.getAllSpecialists(null);
        return ResponseEntity.ok(ApiResponse.success("Specialists retrieved successfully", specialists));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SpecialistDetailResponse>> getSpecialistById(@PathVariable String id) {
        log.info("Fetching specialist with id: {}", id);
        SpecialistDetailResponse specialist = specialistService.getSpecialistById(id);
        return ResponseEntity.ok(ApiResponse.success("Specialist retrieved successfully", specialist));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<SpecialistDetailResponse>> getSpecialistByUserId(@PathVariable String userId) {
        log.info("Fetching specialist with user id: {}", userId);
        SpecialistDetailResponse specialist = specialistService.getSpecialistByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success("Specialist retrieved successfully", specialist));
    }

    @GetMapping("/specialization/{specialization}")
    public ResponseEntity<ApiResponse<List<SpecialistResponse>>> getSpecialistsBySpecialization(
            @PathVariable String specialization) {
        log.info("REST request to get specialists by specialization: {}", specialization);
        List<SpecialistResponse> specialists = specialistService.getSpecialistsBySpecialization(specialization);
        return ResponseEntity.ok(ApiResponse.success("Specialists retrieved successfully", specialists));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SpecialistResponse>> updateSpecialist(
            @PathVariable String id,
            @Valid @RequestBody SpecialistUpdateRequest request) {
        log.info("REST request to update specialist with id: {}", id);
        SpecialistResponse updatedSpecialist = specialistService.updateSpecialist(id, request);
        return ResponseEntity.ok(ApiResponse.success("Specialist updated successfully", updatedSpecialist));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSpecialist(@PathVariable String id) {
        log.info("REST request to delete specialist with id: {}", id);
        specialistService.deleteSpecialist(id);
        return ResponseEntity.ok(ApiResponse.success("Specialist deleted successfully", null));
    }

    @GetMapping("/{id}/schedule")
    public ResponseEntity<ApiResponse<List<WorkScheduleResponse>>> getSpecialistSchedule(@PathVariable String id) {
        log.info("REST request to get schedule for specialist with id: {}", id);
        List<WorkScheduleResponse> schedule = specialistService.getSpecialistSchedule(id);
        return ResponseEntity.ok(ApiResponse.success("Specialist schedule retrieved successfully", schedule));
    }

    @GetMapping("/service/{serviceId}")
    public ResponseEntity<ApiResponse<List<SpecialistResponse>>> getSpecialistsByService(
            @PathVariable String serviceId) {
        log.info("REST request to get specialists by service id: {}", serviceId);
        List<SpecialistResponse> specialists = specialistService.getSpecialistsByService(serviceId);
        return ResponseEntity.ok(ApiResponse.success("Specialists for service retrieved successfully", specialists));
    }
}