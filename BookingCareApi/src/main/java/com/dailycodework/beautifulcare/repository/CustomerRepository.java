package com.dailycodework.beautifulcare.repository;

import com.dailycodework.beautifulcare.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, String> {
    Optional<Customer> findByUsername(String username);

    Optional<Customer> findByEmail(String email);

    boolean existsByEmail(String email);
}