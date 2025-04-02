package com.dailycodework.beautifulcare.controller;

import com.dailycodework.beautifulcare.dto.response.AdminStatsResponse;
import com.dailycodework.beautifulcare.dto.response.BookingResponse;
import com.dailycodework.beautifulcare.dto.response.PopularServiceResponse;
import com.dailycodework.beautifulcare.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for admin dashboard
 */
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Admin dashboard APIs")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final AdminService adminService;

    @GetMapping("/stats")
    @Operation(summary = "Get admin dashboard statistics")
    public ResponseEntity<AdminStatsResponse> getAdminStats() {
        return ResponseEntity.ok(adminService.getAdminStats());
    }

    @GetMapping("/recent-bookings")
    @Operation(summary = "Get recent bookings")
    public ResponseEntity<List<BookingResponse>> getRecentBookings(
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(adminService.getRecentBookings(limit));
    }

    @GetMapping("/popular-services")
    @Operation(summary = "Get popular services")
    public ResponseEntity<List<PopularServiceResponse>> getPopularServices(
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(adminService.getPopularServices(limit));
    }
} 