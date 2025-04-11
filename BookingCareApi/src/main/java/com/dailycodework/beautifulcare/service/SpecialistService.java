package com.dailycodework.beautifulcare.service;

import com.dailycodework.beautifulcare.dto.SpecialistDTO;
import com.dailycodework.beautifulcare.dto.SpecialistRequest;
import com.dailycodework.beautifulcare.entity.SpecialistStatus;

import java.util.List;
import java.util.UUID;

/**
 * Service interface cho quản lý chuyên gia
 */
public interface SpecialistService {
    
    /**
     * Lấy danh sách tất cả chuyên gia
     */
    List<SpecialistDTO> getAllSpecialists();
    
    /**
     * Lấy chuyên gia theo ID
     */
    SpecialistDTO getSpecialistById(UUID id);
    
    /**
     * Tìm chuyên gia theo ID của user
     */
    SpecialistDTO getSpecialistByUserId(UUID userId);
    
    /**
     * Tạo mới chuyên gia
     */
    SpecialistDTO createSpecialist(SpecialistRequest request);
    
    /**
     * Cập nhật thông tin chuyên gia
     */
    SpecialistDTO updateSpecialist(UUID id, SpecialistRequest request);
    
    /**
     * Xóa chuyên gia
     */
    void deleteSpecialist(UUID id);
    
    /**
     * Tìm kiếm chuyên gia theo từ khóa
     */
    List<SpecialistDTO> searchSpecialists(String query);
    
    /**
     * Lấy danh sách chuyên gia theo trạng thái
     */
    List<SpecialistDTO> getSpecialistsByStatus(SpecialistStatus status);
    
    /**
     * Lấy danh sách chuyên gia theo chuyên môn
     */
    List<SpecialistDTO> getSpecialistsBySpecialty(String specialty);
    
    /**
     * Lấy danh sách chuyên gia xếp hạng cao nhất
     */
    List<SpecialistDTO> getTopRatedSpecialists(int limit);
    
    /**
     * Kiểm tra một user có phải là chuyên gia không
     */
    boolean isUserSpecialist(UUID userId);
    
    /**
     * Cập nhật ảnh đại diện cho chuyên gia
     * @param specialistId ID của chuyên gia
     * @param avatarUrl URL của ảnh đại diện mới
     * @return SpecialistDTO đã cập nhật
     */
    SpecialistDTO updateSpecialistAvatar(UUID specialistId, String avatarUrl);
    
    /**
     * Thêm ảnh vào danh sách ảnh của chuyên gia
     * @param specialistId ID của chuyên gia
     * @param imageUrl URL của ảnh mới
     * @return SpecialistDTO đã cập nhật
     */
    SpecialistDTO addSpecialistImage(UUID specialistId, String imageUrl);
    
    /**
     * Xóa ảnh khỏi danh sách ảnh của chuyên gia
     * @param specialistId ID của chuyên gia
     * @param imageUrl URL của ảnh cần xóa
     * @return true nếu xóa thành công, false nếu không tìm thấy
     */
    boolean removeSpecialistImage(UUID specialistId, String imageUrl);
} 