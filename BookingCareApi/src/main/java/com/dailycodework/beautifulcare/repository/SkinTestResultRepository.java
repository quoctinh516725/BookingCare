package com.dailycodework.beautifulcare.repository;

import com.dailycodework.beautifulcare.entity.SkinTestResult;
import com.dailycodework.beautifulcare.entity.SkinType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SkinTestResultRepository extends JpaRepository<SkinTestResult, String> {
    List<SkinTestResult> findByCustomerId(String customerId);

    List<SkinTestResult> findBySkinTestId(String skinTestId);

    List<SkinTestResult> findByResultSkinType(SkinType skinType);

    List<SkinTestResult> findByCustomerIdOrderByCreatedAtDesc(String customerId);

    List<SkinTestResult> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    List<SkinTestResult> findBySkinTestUserId(String userId);
}