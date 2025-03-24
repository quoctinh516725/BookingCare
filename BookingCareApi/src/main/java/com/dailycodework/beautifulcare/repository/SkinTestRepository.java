package com.dailycodework.beautifulcare.repository;

import com.dailycodework.beautifulcare.entity.SkinTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SkinTestRepository extends JpaRepository<SkinTest, String> {
    List<SkinTest> findByActive(Boolean active);

    List<SkinTest> findByUserId(String userId);

    Optional<SkinTest> findFirstByUserIdOrderByTestDateDesc(String userId);

    List<SkinTest> findByUserIdAndTestDateBetween(String userId, LocalDateTime startDate, LocalDateTime endDate);
}