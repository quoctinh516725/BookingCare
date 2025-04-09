package com.dailycodework.beautifulcare.repository;

import com.dailycodework.beautifulcare.entity.ServiceCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ServiceCategoryRepository extends JpaRepository<ServiceCategory, UUID> {
    
    /**
     * Tìm danh mục theo tên
     * @param name Tên danh mục
     * @return Danh mục nếu tìm thấy
     */
    Optional<ServiceCategory> findByName(String name);
    
    /**
     * Tìm danh mục theo mã
     * @param code Mã danh mục
     * @return Danh mục nếu tìm thấy
     */
    Optional<ServiceCategory> findByCode(String code);
    
    /**
     * Kiểm tra danh mục tồn tại theo tên
     * @param name Tên danh mục
     * @return true nếu tồn tại, false nếu không
     */
    boolean existsByName(String name);
    
    /**
     * Kiểm tra danh mục tồn tại theo mã
     * @param code Mã danh mục
     * @return true nếu tồn tại, false nếu không
     */
    boolean existsByCode(String code);
    
    /**
     * Tìm danh mục đang hoạt động
     * @return Danh sách danh mục đang hoạt động
     */
    List<ServiceCategory> findByIsActiveTrue();
    
    /**
     * Tìm danh mục với eager loading services
     * @param id ID danh mục
     * @return Danh mục với danh sách dịch vụ
     */
    @Query("SELECT DISTINCT sc FROM ServiceCategory sc LEFT JOIN FETCH sc.services WHERE sc.id = ?1")
    Optional<ServiceCategory> findByIdWithServices(UUID id);
} 