package com.dailycodework.beautifulcare.repository;

import com.dailycodework.beautifulcare.entity.WorkSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.util.List;

@Repository
public interface WorkScheduleRepository extends JpaRepository<WorkSchedule, String> {
    List<WorkSchedule> findBySpecialistId(String specialistId);

    List<WorkSchedule> findBySpecialistIdAndDayOfWeek(String specialistId, DayOfWeek dayOfWeek);

    List<WorkSchedule> findByDayOfWeekAndAvailable(DayOfWeek dayOfWeek, boolean available);

    List<WorkSchedule> findBySpecialistIdAndAvailable(String specialistId, boolean available);
}