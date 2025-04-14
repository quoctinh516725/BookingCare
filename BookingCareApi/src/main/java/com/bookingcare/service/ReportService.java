package com.bookingcare.service;

import java.util.List;
import java.util.Map;

public interface ReportService {
    List<Map<String, Object>> getRevenueStatistics(int months);
    List<Map<String, Object>> getAppointmentStatistics(int months);
    List<Map<String, Object>> getServiceStatistics();
} 