package com.dailycodework.beautifulcare.repository;

import com.dailycodework.beautifulcare.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, UUID> {
    List<Feedback> findByBookingId(UUID bookingId);

    List<Feedback> findByCustomerId(UUID customerId);

    boolean existsByBookingId(UUID bookingId);

    boolean existsByBookingIdAndCustomerId(UUID bookingId, UUID customerId);
    
    /**
     * Tìm tất cả đánh giá cho nhân viên (staff) dựa trên user_id
     */
    @Query("SELECT f FROM Feedback f JOIN f.booking b WHERE b.staff.id = :staffId")
    List<Feedback> findByStaffId(@Param("staffId") UUID staffId);
    
    /**
     * Tính điểm đánh giá trung bình cho nhân viên (staff)
     */
    @Query("SELECT COALESCE(AVG(f.rating), 0) FROM Feedback f JOIN f.booking b WHERE b.staff.id = :staffId")
    Double calculateAverageRatingForStaff(@Param("staffId") UUID staffId);
}