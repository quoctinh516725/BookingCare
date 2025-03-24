package com.dailycodework.beautifulcare.dto.request;

import lombok.Data;

@Data
public class ServiceCategoryUpdateRequest {
    private String name;
    private String description;
}