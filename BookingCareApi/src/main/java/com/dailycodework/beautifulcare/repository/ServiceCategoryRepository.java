package com.dailycodework.beautifulcare.repository;

import com.dailycodework.beautifulcare.entity.ServiceCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceCategoryRepository extends JpaRepository<ServiceCategory, String> {
    Optional<ServiceCategory> findByName(String name);

    List<ServiceCategory> findByNameContainingIgnoreCase(String name);

    boolean existsByName(String name);
}