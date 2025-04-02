package com.dailycodework.beautifulcare.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for popular services
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PopularServiceResponse {
    private String id;
    private String name;
    private String description;
    private double price;
    private long bookingCount;
    private double revenue;
} 