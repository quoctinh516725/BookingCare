package com.dailycodework.beautifulcare.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BookingDetailResponse {
    private String id;
    private ServiceResponse service;
    private double price;
    private int quantity;
    private String note;
    private SpecialistResponse requestedSpecialist;
    private LocalDateTime createdAt;
}