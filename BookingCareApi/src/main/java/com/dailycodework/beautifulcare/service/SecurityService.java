package com.dailycodework.beautifulcare.service;

import com.dailycodework.beautifulcare.entity.User;
import com.dailycodework.beautifulcare.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

/**
 * Service để kiểm tra các quyền truy cập của người dùng
 */
@Service
@Slf4j
@AllArgsConstructor
public class SecurityService {
    private final UserRepository userRepository;

    /**
     * Kiểm tra xem userId được truyền vào có phải là người dùng hiện tại không
     * 
     * @param userId ID của người dùng cần kiểm tra
     * @return true nếu userId trùng với ID người dùng hiện tại, false nếu không
     */
    public boolean isCurrentUser(String userId) {
        String currentUserId = getCurrentUserId();
        log.debug("Checking if {} is current user: {}", userId, currentUserId);
        return currentUserId != null && currentUserId.equals(userId);
    }

    /**
     * Overload của phương thức isCurrentUser, lấy Authentication từ tham số
     * 
     * @param authentication Đối tượng Authentication
     * @param userId         ID của người dùng cần kiểm tra
     * @return true nếu userId trùng với ID người dùng hiện tại, false nếu không
     */
    public boolean isCurrentUser(Authentication authentication, String userId) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        if (authentication.getPrincipal() instanceof Jwt) {
            Jwt jwt = (Jwt) authentication.getPrincipal();
            String currentUserId = jwt.getClaim("userId");
            log.debug("Authentication userId from JWT: {}", currentUserId);
            return currentUserId != null && currentUserId.equals(userId);
        }

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return false;
        }

        String currentUsername = authentication.getName();
        return user.getUsername().equals(currentUsername);
    }

    /**
     * Lấy ID của người dùng hiện tại từ JWT token
     * 
     * @return ID người dùng hoặc null nếu không xác thực
     */
    public String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        if (authentication.getPrincipal() instanceof Jwt) {
            Jwt jwt = (Jwt) authentication.getPrincipal();
            return jwt.getClaim("userId");
        }

        return null;
    }

    /**
     * Lấy thông tin User đầy đủ của người dùng hiện tại
     * 
     * @return User entity của người dùng hiện tại
     * @throws UsernameNotFoundException nếu không tìm thấy người dùng
     */
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UsernameNotFoundException("No authenticated user found");
        }

        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }
}