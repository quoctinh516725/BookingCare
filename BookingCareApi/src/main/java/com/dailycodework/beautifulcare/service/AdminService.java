package com.dailycodework.beautifulcare.service;

import com.dailycodework.beautifulcare.dto.response.AdminStatsResponse;
import com.dailycodework.beautifulcare.dto.response.BookingResponse;
import com.dailycodework.beautifulcare.dto.response.PopularServiceResponse;

import java.util.List;

/**
 * Service interface for admin dashboard operations
 */
public interface AdminService {
    /**
     * Get admin dashboard statistics
     * @return AdminStatsResponse containing overall statistics
     */
    AdminStatsResponse getAdminStats();

    /**
     * Get recent bookings
     * @param limit number of bookings to retrieve
     * @return List of BookingResponse
     */
    List<BookingResponse> getRecentBookings(int limit);

    /**
     * Get popular services
     * @param limit number of services to retrieve
     * @return List of PopularServiceResponse
     */
    List<PopularServiceResponse> getPopularServices(int limit);
} 