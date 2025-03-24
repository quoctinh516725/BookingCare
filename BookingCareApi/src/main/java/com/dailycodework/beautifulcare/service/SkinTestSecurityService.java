package com.dailycodework.beautifulcare.service;

import com.dailycodework.beautifulcare.entity.SkinTestResult;
import com.dailycodework.beautifulcare.entity.User;
import com.dailycodework.beautifulcare.repository.SkinTestResultRepository;
import com.dailycodework.beautifulcare.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

/**
 * Service kiểm tra bảo mật cho các thao tác trên skin test và kết quả test
 */
@Service
public class SkinTestSecurityService {

    private final SkinTestResultRepository skinTestResultRepository;
    private final UserRepository userRepository;

    @Autowired
    public SkinTestSecurityService(SkinTestResultRepository skinTestResultRepository,
            UserRepository userRepository) {
        this.skinTestResultRepository = skinTestResultRepository;
        this.userRepository = userRepository;
    }

    /**
     * Kiểm tra xem người dùng hiện tại có phải là chủ sở hữu của kết quả skin test
     * không
     * 
     * @param resultId ID của kết quả skin test cần kiểm tra
     * @return true nếu người dùng hiện tại là chủ sở hữu của kết quả skin test
     */
    public boolean isTestResultOwner(String resultId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        String currentUsername = authentication.getName();
        User currentUser = userRepository.findByUsername(currentUsername).orElse(null);
        if (currentUser == null) {
            return false;
        }

        SkinTestResult result = skinTestResultRepository.findById(resultId).orElse(null);
        if (result == null || result.getCustomer() == null) {
            return false;
        }

        // Customer kế thừa từ User nên không cần gọi getUser()
        return result.getCustomer().getId().equals(currentUser.getId());
    }
}