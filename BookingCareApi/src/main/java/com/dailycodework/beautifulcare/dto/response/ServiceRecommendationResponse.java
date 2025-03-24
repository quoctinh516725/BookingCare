package com.dailycodework.beautifulcare.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceRecommendationResponse {
    private String serviceId;
    private String serviceName;
    private String description;
    private double price;
    private String imageUrl;
    private String categoryName;
    private int matchScore; // Điểm phù hợp với loại da của khách hàng
    private String recommendationReason; // Lý do đề xuất
}