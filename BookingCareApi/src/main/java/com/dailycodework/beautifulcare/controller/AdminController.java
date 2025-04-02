package com.dailycodework.beautifulcare.controller;

import com.dailycodework.beautifulcare.dto.response.AdminStatsResponse;
import com.dailycodework.beautifulcare.dto.response.BookingResponse;
import com.dailycodework.beautifulcare.dto.response.PopularServiceResponse;
import com.dailycodework.beautifulcare.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
@Slf4j
public class AdminController {
    private final AdminService adminService;

    @GetMapping("/stats")
    @Operation(summary = "Get admin dashboard statistics")
    public ResponseEntity<AdminStatsResponse> getAdminStats() {
        log.info("Received request for admin stats");
        AdminStatsResponse stats = adminService.getAdminStats();
        log.info("Returning admin stats: {}", stats);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/recent-bookings")
    @Operation(summary = "Get recent bookings")
    public ResponseEntity<List<BookingResponse>> getRecentBookings(
            @RequestParam(defaultValue = "5") int limit) {
        log.info("Received request for recent bookings, limit: {}", limit);
        List<BookingResponse> bookings = adminService.getRecentBookings(limit);
        log.info("Returning {} recent bookings", bookings.size());
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/popular-services")
    @Operation(summary = "Get popular services")
    public ResponseEntity<List<PopularServiceResponse>> getPopularServices(
            @RequestParam(defaultValue = "5") int limit) {
        log.info("Received request for popular services, limit: {}", limit);
        List<PopularServiceResponse> services = adminService.getPopularServices(limit);
        log.info("Returning {} popular services", services.size());
        return ResponseEntity.ok(services);
    }
} 