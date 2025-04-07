package com.dailycodework.beautifulcare.repository;

import com.dailycodework.beautifulcare.entity.Service;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ServiceRepository extends JpaRepository<Service, UUID> {
    List<Service> findByIsActiveTrue();

    boolean existsByName(String name);
    
    /**
     * Find most popular services based on booking count
     * Uses a join to count how many times each service appears in bookings
     * 
     * @param pageable pagination information (for limit)
     * @return list of services ordered by popularity (booking count)
     */
    @Query("SELECT DISTINCT s FROM Service s " +
           "LEFT JOIN s.bookings b " +
           "GROUP BY s.id " +
           "ORDER BY COUNT(b.id) DESC")
    List<Service> findPopularServices(Pageable pageable);
    
    /**
     * Find services with eager loading of related booking data
     * 
     * @return list of all services with booking data
     */
    @Query("SELECT DISTINCT s FROM Service s LEFT JOIN FETCH s.bookings")
    List<Service> findAllWithBookings();
}