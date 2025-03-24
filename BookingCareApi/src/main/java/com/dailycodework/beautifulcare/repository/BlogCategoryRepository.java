package com.dailycodework.beautifulcare.repository;

import com.dailycodework.beautifulcare.entity.BlogCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BlogCategoryRepository extends JpaRepository<BlogCategory, String> {
    Optional<BlogCategory> findByName(String name);
}