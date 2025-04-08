package com.dailycodework.beautifulcare.repository;

import com.dailycodework.beautifulcare.entity.User;
import com.dailycodework.beautifulcare.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    
    @Query("SELECT u FROM User u WHERE u.username = :username OR u.email = :email")
    Optional<User> findByUsernameOrEmail(@Param("username") String username, @Param("email") String email);

    List<User> findByRole(UserRole role);
    
    /**
     * Count users by role
     * @param role UserRole to count
     * @return number of users with the given role
     */
    long countByRole(UserRole role);
    
    /**
     * Lấy tất cả người dùng với eager loading các nhóm quyền và quyền
     * @return Danh sách tất cả người dùng với đầy đủ thông tin quyền
     */
    @Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.permissionGroups")
    List<User> findAllWithPermissionGroups();
    
    /**
     * Lấy tất cả người dùng theo vai trò với eager loading các nhóm quyền và quyền
     * @param role Vai trò người dùng
     * @return Danh sách người dùng theo vai trò với đầy đủ thông tin quyền
     */
    @Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.permissionGroups WHERE u.role = :role")
    List<User> findByRoleWithPermissionGroups(@Param("role") UserRole role);
    
    /**
     * Tìm người dùng theo ID với eager loading các nhóm quyền và quyền
     * @param id ID người dùng
     * @return Optional chứa User nếu tìm thấy
     */
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.permissionGroups pg LEFT JOIN FETCH pg.permissions WHERE u.id = :id")
    Optional<User> findByIdWithPermissions(@Param("id") UUID id);
    
    /**
     * Tìm kiếm người dùng theo tên đăng nhập và tải eager các nhóm quyền và quyền
     * @param username Tên đăng nhập
     * @return Optional chứa User nếu tìm thấy
     */
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.permissionGroups pg LEFT JOIN FETCH pg.permissions WHERE u.username = :username")
    Optional<User> findByUsernameWithPermissions(@Param("username") String username);
    
    /**
     * Tìm kiếm người dùng theo email và tải eager các nhóm quyền và quyền
     * @param email Email
     * @return Optional chứa User nếu tìm thấy
     */
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.permissionGroups pg LEFT JOIN FETCH pg.permissions WHERE u.email = :email")
    Optional<User> findByEmailWithPermissions(@Param("email") String email);
    
    /**
     * Tìm kiếm người dùng theo username hoặc email và tải eager các nhóm quyền và quyền
     * @param username Tên đăng nhập
     * @param email Email
     * @return Optional chứa User nếu tìm thấy
     */
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.permissionGroups pg LEFT JOIN FETCH pg.permissions WHERE u.username = :username OR u.email = :email")
    Optional<User> findByUsernameOrEmailWithPermissions(@Param("username") String username, @Param("email") String email);
    
    /**
     * Tìm người dùng theo ID với tất cả dữ liệu quyền được tải trong một truy vấn duy nhất
     * Sử dụng DISTINCT để tránh trùng lặp kết quả
     * @param id ID người dùng
     * @return Optional chứa User nếu tìm thấy
     */
    @Query("SELECT DISTINCT u FROM User u " +
           "LEFT JOIN FETCH u.permissionGroups pg " +
           "LEFT JOIN FETCH pg.permissions p " +
           "WHERE u.id = :id")
    Optional<User> findByIdWithPermissionsFull(@Param("id") UUID id);
    
    /**
     * Tìm người dùng theo username hoặc email với tất cả dữ liệu quyền được tải trong một truy vấn duy nhất
     * Sử dụng DISTINCT để tránh trùng lặp kết quả
     * @param username Tên đăng nhập
     * @param email Email
     * @return Optional chứa User nếu tìm thấy
     */
    @Query("SELECT DISTINCT u FROM User u " +
           "LEFT JOIN FETCH u.permissionGroups pg " +
           "LEFT JOIN FETCH pg.permissions p " +
           "WHERE u.username = :username OR u.email = :email")
    Optional<User> findByUsernameOrEmailWithPermissionsFull(@Param("username") String username, @Param("email") String email);

    @Query("SELECT DISTINCT u FROM User u " +
           "LEFT JOIN FETCH u.permissionGroups pg " +
           "LEFT JOIN FETCH pg.permissions p " +
           "WHERE u.username = :username")
    Optional<User> findByUsernameWithPermissionGroups(@Param("username") String username);
}
