package com.dailycodework.beautifulcare.repository;

import com.dailycodework.beautifulcare.entity.Specialist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SpecialistRepository extends JpaRepository<Specialist, String> {
    Optional<Specialist> findByUserId(String userId);

    List<Specialist> findBySpecialization(String specialization);

    List<Specialist> findByServicesId(String serviceId);

    boolean existsByUserId(String userId);

    @Query("SELECT s FROM Specialist s WHERE s.user.active = :active")
    List<Specialist> findByUserActive(Boolean active);
}