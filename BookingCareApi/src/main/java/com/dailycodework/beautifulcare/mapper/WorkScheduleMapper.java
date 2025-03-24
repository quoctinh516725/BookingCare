package com.dailycodework.beautifulcare.mapper;

import com.dailycodework.beautifulcare.dto.response.WorkScheduleResponse;
import com.dailycodework.beautifulcare.entity.WorkSchedule;
import org.springframework.stereotype.Component;

@Component
public class WorkScheduleMapper {

    private final SpecialistMapper specialistMapper;

    public WorkScheduleMapper(SpecialistMapper specialistMapper) {
        this.specialistMapper = specialistMapper;
    }

    public WorkScheduleResponse toWorkScheduleResponse(WorkSchedule workSchedule) {
        WorkScheduleResponse response = new WorkScheduleResponse();
        response.setId(workSchedule.getId());
        response.setDayOfWeek(workSchedule.getDayOfWeek());
        response.setStartTime(workSchedule.getStartTime());
        response.setEndTime(workSchedule.getEndTime());
        response.setAvailable(workSchedule.isAvailable());
        response.setCreatedAt(workSchedule.getCreatedAt());

        if (workSchedule.getSpecialist() != null) {
            response.setSpecialist(specialistMapper.toSpecialistResponse(workSchedule.getSpecialist()));
        }

        return response;
    }
}