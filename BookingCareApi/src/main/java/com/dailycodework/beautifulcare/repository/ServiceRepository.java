package com.dailycodework.beautifulcare.repository;

import com.dailycodework.beautifulcare.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ServiceRepository extends JpaRepository<Service, UUID> {
    List<Service> findByIsActiveTrue();

    boolean existsByName(String name);
}