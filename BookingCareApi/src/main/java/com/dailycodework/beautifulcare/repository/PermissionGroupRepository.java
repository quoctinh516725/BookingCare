package com.dailycodework.beautifulcare.repository;

import com.dailycodework.beautifulcare.entity.PermissionGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PermissionGroupRepository extends JpaRepository<PermissionGroup, UUID> {
    /**
     * Tìm nhóm quyền theo tên
     * @param name Tên nhóm quyền
     * @return Nhóm quyền nếu tìm thấy
     */
    Optional<PermissionGroup> findByName(String name);
    
    /**
     * Kiểm tra xem tên nhóm quyền đã tồn tại chưa
     * @param name Tên nhóm quyền
     * @return true nếu tên nhóm quyền đã tồn tại, false nếu chưa
     */
    boolean existsByName(String name);
    
    /**
     * Lấy danh sách nhóm quyền của một người dùng
     * @param userId ID của người dùng
     * @return Danh sách nhóm quyền
     */
    @Query("SELECT pg FROM PermissionGroup pg JOIN pg.users u WHERE u.id = :userId")
    List<PermissionGroup> findByUserId(@Param("userId") UUID userId);

    @Query("SELECT pg FROM PermissionGroup pg LEFT JOIN FETCH pg.permissions WHERE pg.id = :id")
    Optional<PermissionGroup> findByIdWithPermissions(@Param("id") UUID id);
} 