package com.dailycodework.beautifulcare.dto.response;

import lombok.Data;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
public class WorkScheduleResponse {
    private String id;
    private DayOfWeek dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private boolean available;
    private SpecialistResponse specialist;
    private LocalDateTime createdAt;
}