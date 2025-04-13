package com.dailycodework.beautifulcare.repository;

import com.dailycodework.beautifulcare.entity.Specialist;
import com.dailycodework.beautifulcare.entity.SpecialistStatus;
import com.dailycodework.beautifulcare.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SpecialistRepository extends JpaRepository<Specialist, UUID> {
    
    /**
     * Tìm chuyên gia theo ID của user
     */
    Optional<Specialist> findByUserId(UUID userId);
    
    /**
     * Tìm chuyên gia theo user object
     */
    Optional<Specialist> findByUser(User user);
    
    /**
     * Danh sách chuyên gia theo trạng thái
     */
    List<Specialist> findByStatus(SpecialistStatus status);
    
    /**
     * Danh sách chuyên gia theo chuyên môn
     */
    List<Specialist> findBySpecialtyContainingIgnoreCase(String specialty);
    
    /**
     * Tìm kiếm chuyên gia dựa trên nhiều tiêu chí
     */
    @Query("SELECT s FROM Specialist s JOIN s.user u WHERE " +
           "LOWER(s.specialty) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " + 
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.qualification) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.biography) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Specialist> searchSpecialists(@Param("query") String query);
    
    /**
     * Đếm số lượng chuyên gia theo trạng thái
     */
    long countByStatus(SpecialistStatus status);
    
    /**
     * Lấy danh sách chuyên gia theo xếp hạng cao nhất
     */
    List<Specialist> findByRatingGreaterThanEqualOrderByRatingDesc(Float minRating);
    
    /**
     * Kiểm tra user có phải là chuyên gia không
     */
    boolean existsByUser(User user);
    
    /**
     * Tìm chuyên gia theo ID hoặc theo ID của user
     * Sử dụng cho việc xác thực trong booking
     */
    @Query("SELECT s FROM Specialist s WHERE s.id = :id OR s.user.id = :id")
    Optional<Specialist> findByIdOrUserId(@Param("id") UUID id);
} 