package com.bookingcare.controller;

import com.bookingcare.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/revenue")
    public ResponseEntity<?> getRevenueStatistics(@RequestParam(defaultValue = "6") int months) {
        return ResponseEntity.ok(reportService.getRevenueStatistics(months));
    }

    @GetMapping("/appointments")
    public ResponseEntity<?> getAppointmentStatistics(@RequestParam(defaultValue = "6") int months) {
        return ResponseEntity.ok(reportService.getAppointmentStatistics(months));
    }

    @GetMapping("/services")
    public ResponseEntity<?> getServiceStatistics() {
        return ResponseEntity.ok(reportService.getServiceStatistics());
    }
} 