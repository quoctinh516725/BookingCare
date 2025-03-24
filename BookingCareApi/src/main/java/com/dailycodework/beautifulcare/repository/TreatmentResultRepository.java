package com.dailycodework.beautifulcare.repository;

import com.dailycodework.beautifulcare.entity.TreatmentResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for TreatmentResult entity operations.
 */
@Repository
public interface TreatmentResultRepository extends JpaRepository<TreatmentResult, String> {

    /**
     * Find a treatment result by treatment ID
     * 
     * @param treatmentId The treatment ID
     * @return Optional treatment result
     */
    Optional<TreatmentResult> findByTreatmentId(String treatmentId);

    /**
     * Check if a treatment result exists for a specific treatment
     * 
     * @param treatmentId The treatment ID
     * @return true if exists, false otherwise
     */
    boolean existsByTreatmentId(String treatmentId);
}