package com.dailycodework.beautifulcare.repository;

import com.dailycodework.beautifulcare.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, UUID> {
    /**
     * Tìm quyền theo mã
     * @param code Mã quyền
     * @return Quyền nếu tìm thấy
     */
    Optional<Permission> findByCode(String code);
    
    /**
     * Tìm quyền theo tên
     * @param name Tên quyền
     * @return Quyền nếu tìm thấy
     */
    Optional<Permission> findByName(String name);
    
    /**
     * Kiểm tra xem mã quyền đã tồn tại chưa
     * @param code Mã quyền
     * @return true nếu mã quyền đã tồn tại, false nếu chưa
     */
    boolean existsByCode(String code);
    
    /**
     * Kiểm tra xem tên quyền đã tồn tại chưa
     * @param name Tên quyền
     * @return true nếu tên quyền đã tồn tại, false nếu chưa
     */
    boolean existsByName(String name);
} 