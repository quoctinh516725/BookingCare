package com.dailycodework.beautifulcare.repository;

import com.dailycodework.beautifulcare.entity.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceRepository extends JpaRepository<Service, String> {
    List<Service> findByCategoryId(String categoryId);

    Optional<Service> findByName(String name);

    boolean existsByName(String name);

    List<Service> findByNameContainingIgnoreCase(String keyword);

    Page<Service> findAll(Pageable pageable);
}