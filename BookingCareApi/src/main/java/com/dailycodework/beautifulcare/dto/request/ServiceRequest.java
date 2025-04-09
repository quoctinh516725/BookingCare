package com.dailycodework.beautifulcare.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ServiceRequest {
    private String name;
    private String description;
    private BigDecimal price;
    private Integer duration;
    private String image;
    private Boolean isActive;
    private UUID categoryId;
}