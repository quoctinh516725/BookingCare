package com.bookingcare.service.impl;

import com.bookingcare.repository.AppointmentRepository;
import com.bookingcare.repository.ServiceRepository;
import com.bookingcare.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportServiceImpl implements ReportService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Override
    public List<Map<String, Object>> getRevenueStatistics(int months) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusMonths(months);
        
        return appointmentRepository.findRevenueByMonth(startDate, endDate)
            .stream()
            .map(result -> Map.of(
                "month", ((String) result[0]).substring(0, 7),
                "revenue", result[1]
            ))
            .collect(Collectors.toList());
    }

    @Override
    public List<Map<String, Object>> getAppointmentStatistics(int months) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusMonths(months);
        
        return appointmentRepository.findAppointmentsByMonth(startDate, endDate)
            .stream()
            .map(result -> Map.of(
                "month", ((String) result[0]).substring(0, 7),
                "appointments", result[1]
            ))
            .collect(Collectors.toList());
    }

    @Override
    public List<Map<String, Object>> getServiceStatistics() {
        return serviceRepository.findServiceUsageStatistics()
            .stream()
            .map(result -> Map.of(
                "name", result[0],
                "value", result[1]
            ))
            .collect(Collectors.toList());
    }
} 