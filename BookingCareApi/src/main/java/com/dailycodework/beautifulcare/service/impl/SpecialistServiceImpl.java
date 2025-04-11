package com.dailycodework.beautifulcare.service.impl;

import com.dailycodework.beautifulcare.dto.SpecialistDTO;
import com.dailycodework.beautifulcare.dto.SpecialistRequest;
import com.dailycodework.beautifulcare.entity.Specialist;
import com.dailycodework.beautifulcare.entity.SpecialistStatus;
import com.dailycodework.beautifulcare.entity.User;
import com.dailycodework.beautifulcare.exception.ResourceNotFoundException;
import com.dailycodework.beautifulcare.mapper.SpecialistMapper;
import com.dailycodework.beautifulcare.repository.FeedbackRepository;
import com.dailycodework.beautifulcare.repository.SpecialistRepository;
import com.dailycodework.beautifulcare.repository.UserRepository;
import com.dailycodework.beautifulcare.service.SpecialistService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SpecialistServiceImpl implements SpecialistService {

    private final SpecialistRepository specialistRepository;
    private final UserRepository userRepository;
    private final FeedbackRepository feedbackRepository;
    private final SpecialistMapper specialistMapper;

    @Override
    @Transactional(readOnly = true)
    public List<SpecialistDTO> getAllSpecialists() {
        log.info("Lấy danh sách tất cả chuyên gia");
        return specialistRepository.findAll().stream()
                .map(specialistMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SpecialistDTO getSpecialistById(UUID id) {
        log.info("Lấy thông tin chuyên gia với ID: {}", id);
        return specialistRepository.findById(id)
                .map(specialistMapper::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chuyên gia với ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public SpecialistDTO getSpecialistByUserId(UUID userId) {
        log.info("Lấy thông tin chuyên gia với user ID: {}", userId);
        return specialistRepository.findByUserId(userId)
                .map(specialistMapper::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chuyên gia với user ID: " + userId));
    }

    @Override
    @Transactional
    public SpecialistDTO createSpecialist(SpecialistRequest request) {
        log.info("Tạo mới chuyên gia với user ID: {}", request.getUserId());
        
        // Kiểm tra xem user đã tồn tại chưa
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user với ID: " + request.getUserId()));
        
        // Kiểm tra xem user đã là chuyên gia chưa
        if (specialistRepository.existsByUser(user)) {
            throw new IllegalStateException("User này đã là chuyên gia");
        }
        
        // Tạo mới entity Specialist
        Specialist specialist = specialistMapper.createEntityFromRequest(request, user);
        
        // Nếu status không được chỉ định, đặt mặc định là ACTIVE
        if (specialist.getStatus() == null) {
            specialist.setStatus(SpecialistStatus.ACTIVE);
        }
        
        // Lưu vào database
        Specialist savedSpecialist = specialistRepository.save(specialist);
        
        // Cập nhật rating từ feedbacks nếu có
        updateSpecialistRating(savedSpecialist);
        
        return specialistMapper.toDTO(savedSpecialist);
    }

    @Override
    @Transactional
    public SpecialistDTO updateSpecialist(UUID id, SpecialistRequest request) {
        log.info("Cập nhật thông tin chuyên gia với ID: {}", id);
        
        // Tìm chuyên gia theo ID
        Specialist specialist = specialistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chuyên gia với ID: " + id));
        
        // Nếu userId thay đổi, cập nhật user cho chuyên gia
        if (request.getUserId() != null && !request.getUserId().equals(specialist.getUser().getId())) {
            User newUser = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user với ID: " + request.getUserId()));
            
            // Kiểm tra xem user mới đã là chuyên gia chưa
            if (specialistRepository.existsByUser(newUser)) {
                throw new IllegalStateException("User này đã là chuyên gia");
            }
            
            specialist.setUser(newUser);
            
            // Đảm bảo cập nhật rating nếu thay đổi user
            updateSpecialistRating(specialist);
        }
        
        // Cập nhật các trường khác từ request
        specialistMapper.updateEntityFromRequest(specialist, request);
        
        // Lưu vào database
        Specialist updatedSpecialist = specialistRepository.save(specialist);
        
        return specialistMapper.toDTO(updatedSpecialist);
    }

    @Override
    @Transactional
    public void deleteSpecialist(UUID id) {
        log.info("Xóa chuyên gia với ID: {}", id);
        
        // Kiểm tra chuyên gia có tồn tại không
        if (!specialistRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy chuyên gia với ID: " + id);
        }
        
        specialistRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SpecialistDTO> searchSpecialists(String query) {
        log.info("Tìm kiếm chuyên gia với từ khóa: {}", query);
        return specialistRepository.searchSpecialists(query).stream()
                .map(specialistMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SpecialistDTO> getSpecialistsByStatus(SpecialistStatus status) {
        log.info("Lấy danh sách chuyên gia theo trạng thái: {}", status);
        return specialistRepository.findByStatus(status).stream()
                .map(specialistMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SpecialistDTO> getSpecialistsBySpecialty(String specialty) {
        log.info("Lấy danh sách chuyên gia theo chuyên môn: {}", specialty);
        return specialistRepository.findBySpecialtyContainingIgnoreCase(specialty).stream()
                .map(specialistMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SpecialistDTO> getTopRatedSpecialists(int limit) {
        log.info("Lấy danh sách {} chuyên gia xếp hạng cao nhất", limit);
        return specialistRepository.findByRatingGreaterThanEqualOrderByRatingDesc(0.0f).stream()
                .map(specialistMapper::toDTO)
                .limit(limit)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isUserSpecialist(UUID userId) {
        log.info("Kiểm tra user có phải là chuyên gia không, user ID: {}", userId);
        
        // Tìm user với ID
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user với ID: " + userId));
        
        return specialistRepository.existsByUser(user);
    }
    
    @Override
    @Transactional
    public SpecialistDTO updateSpecialistAvatar(UUID specialistId, String avatarUrl) {
        log.info("Cập nhật ảnh đại diện cho chuyên gia ID: {}", specialistId);
        
        // Tìm chuyên gia theo ID
        Specialist specialist = specialistRepository.findById(specialistId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chuyên gia với ID: " + specialistId));
        
        // Cập nhật ảnh đại diện
        specialist.setAvatarUrl(avatarUrl);
        
        // Lưu vào database
        Specialist updatedSpecialist = specialistRepository.save(specialist);
        
        return specialistMapper.toDTO(updatedSpecialist);
    }
    
    @Override
    @Transactional
    public SpecialistDTO addSpecialistImage(UUID specialistId, String imageUrl) {
        log.info("Thêm ảnh mới cho chuyên gia ID: {}", specialistId);
        
        // Tìm chuyên gia theo ID
        Specialist specialist = specialistRepository.findById(specialistId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chuyên gia với ID: " + specialistId));
        
        // Thêm ảnh vào danh sách
        specialist.addImage(imageUrl);
        
        // Lưu vào database
        Specialist updatedSpecialist = specialistRepository.save(specialist);
        
        return specialistMapper.toDTO(updatedSpecialist);
    }
    
    @Override
    @Transactional
    public boolean removeSpecialistImage(UUID specialistId, String imageUrl) {
        log.info("Xóa ảnh khỏi chuyên gia ID: {}", specialistId);
        
        // Tìm chuyên gia theo ID
        Specialist specialist = specialistRepository.findById(specialistId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chuyên gia với ID: " + specialistId));
        
        // Xóa ảnh từ danh sách
        boolean removed = specialist.removeImage(imageUrl);
        
        if (removed) {
            // Chỉ lưu vào database nếu thực sự có ảnh bị xóa
            specialistRepository.save(specialist);
            log.info("Đã xóa ảnh thành công");
        } else {
            log.warn("Không tìm thấy ảnh để xóa");
        }
        
        return removed;
    }
    
    /**
     * Cập nhật rating cho chuyên gia dựa trên các feedback
     * @param specialist Chuyên gia cần cập nhật rating
     */
    private void updateSpecialistRating(Specialist specialist) {
        if (specialist == null || specialist.getUser() == null) {
            return;
        }
        
        UUID userId = specialist.getUser().getId();
        Double averageRating = feedbackRepository.calculateAverageRatingForStaff(userId);
        
        if (averageRating != null) {
            specialist.setRating(averageRating.floatValue());
            specialistRepository.save(specialist);
            log.info("Đã cập nhật rating cho chuyên gia ID {}: {}", specialist.getId(), averageRating);
        }
    }
    
    /**
     * Cập nhật rating cho tất cả chuyên gia dựa trên feedbacks
     * Hàm này được lên lịch chạy mỗi ngày vào lúc 2 giờ sáng
     */
    @Scheduled(cron = "0 0 2 * * *")
    @Transactional
    public void updateAllSpecialistRatings() {
        log.info("Bắt đầu cập nhật rating cho tất cả các chuyên gia");
        
        List<Specialist> specialists = specialistRepository.findAll();
        int updatedCount = 0;
        
        for (Specialist specialist : specialists) {
            try {
                updateSpecialistRating(specialist);
                updatedCount++;
            } catch (Exception e) {
                log.error("Lỗi khi cập nhật rating cho chuyên gia ID {}: {}", specialist.getId(), e.getMessage());
            }
        }
        
        log.info("Hoàn thành cập nhật rating: {} chuyên gia đã được cập nhật", updatedCount);
    }
} 