package com.dailycodework.beautifulcare.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for admin dashboard statistics
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {
    private long userCount;
    private double userGrowth;
    private long serviceCount;
    private double serviceGrowth;
    private long staffCount;
    private double staffGrowth;
    private long bookingCount;
    private double bookingGrowth;
    private double revenue;
    private double revenueGrowth;
} 