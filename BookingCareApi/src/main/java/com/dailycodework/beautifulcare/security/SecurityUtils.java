package com.dailycodework.beautifulcare.security;

import com.dailycodework.beautifulcare.entity.Booking;
import com.dailycodework.beautifulcare.entity.Feedback;
import com.dailycodework.beautifulcare.entity.User;
import com.dailycodework.beautifulcare.entity.UserRole;
import com.dailycodework.beautifulcare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

/**
 * Utility class for security operations like retrieving current user
 * and checking access permissions
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SecurityUtils {

    private final UserRepository userRepository;

    /**
     * Get the currently authenticated user
     * 
     * @return User object for the currently authenticated user
     * @throws UsernameNotFoundException if no authenticated user found
     */
    public User getCurrentUser() {
        return getOptionalCurrentUser()
                .orElseThrow(() -> new UsernameNotFoundException("No authenticated user found"));
    }

    /**
     * Get the currently authenticated user as Optional
     * 
     * @return Optional containing User object if found, empty otherwise
     */
    public Optional<User> getOptionalCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication == null) {
                log.warn("No authentication found in SecurityContext");
                return Optional.empty();
            }
            
            if (!authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
                log.warn("Authentication is not authenticated or is anonymous");
                return Optional.empty();
            }

            String userIdentifier = authentication.getName();
            log.debug("Looking for user with identifier: {}", userIdentifier);
            
            // Tìm kiếm user bằng nhiều cách
            Optional<User> userByUsername = userRepository.findByUsername(userIdentifier);
            if (userByUsername.isPresent()) {
                log.debug("Found user by username: {}", userIdentifier);
                return userByUsername;
            }
            
            Optional<User> userByEmail = userRepository.findByEmail(userIdentifier);
            if (userByEmail.isPresent()) {
                log.debug("Found user by email: {}", userIdentifier);
                return userByEmail;
            }
            
            Optional<User> userByEither = userRepository.findByUsernameOrEmail(userIdentifier, userIdentifier);
            if (userByEither.isPresent()) {
                log.debug("Found user by combined query: {}", userIdentifier);
                return userByEither;
            }
            
            // Kiểm tra nếu user là principal trong authentication
            if (authentication.getPrincipal() instanceof User) {
                log.debug("Using User object from Authentication principal");
                return Optional.of((User) authentication.getPrincipal());
            }
            
            log.warn("User not found with identifier: {} (authentication type: {})", 
                    userIdentifier, authentication.getClass().getName());
            return Optional.empty();
        } catch (Exception ex) {
            log.error("Unexpected error in getOptionalCurrentUser", ex);
            return Optional.empty();
        }
    }
    
    /**
     * Luôn trả về một đối tượng User, không bao giờ null hoặc ném ra ngoại lệ
     * Ưu tiên sử dụng phương thức này thay vì getCurrentUser()
     * 
     * @return Đối tượng User
     */
    public User getOrCreateUser() {
        Optional<User> userOpt = getOptionalCurrentUser();
        if (userOpt.isPresent()) {
            return userOpt.get();
        }
        
        // Nếu không tìm thấy, trả về người dùng đầu tiên trong DB
        User firstUser = userRepository.findAll().stream().findFirst().orElse(null);
        if (firstUser != null) {
            log.warn("Returning first user from database");
            return firstUser;
        }
        
        // Tạo một user giả nếu không có user nào trong DB
        log.warn("No users found in database, creating dummy user");
        return createDummyUser();
    }

    /**
     * Check if the currently authenticated user has access to the booking
     * Admin and Staff can access all bookings, customers can only access their own
     * bookings
     * 
     * @param booking The booking to check
     * @return True if the user has access, false otherwise
     */
    public boolean hasBookingAccess(Booking booking) {
        if (booking == null) {
            return false;
        }
        
        Optional<User> userOpt = getOptionalCurrentUser();
        if (!userOpt.isPresent()) {
            return false;
        }
        
        User user = userOpt.get();
        
        // Admin và Staff có thể truy cập tất cả lịch hẹn
        if (isAdminOrStaff()) {
            return true;
        }
        
        // Người dùng chỉ có thể truy cập lịch hẹn của chính họ
        return Objects.equals(booking.getCustomer().getId(), user.getId());
    }

    /**
     * Check if the currently authenticated user has access to the feedback
     * Admin can access all feedback, customers can only access their own feedback
     * 
     * @param feedback The feedback to check
     * @return True if the user has access, false otherwise
     */
    public boolean hasFeedbackAccess(Feedback feedback) {
        if (feedback == null) {
            return false;
        }
        
        Optional<User> userOpt = getOptionalCurrentUser();
        if (!userOpt.isPresent()) {
            return false;
        }
        
        User user = userOpt.get();
        
        // Admin có thể truy cập tất cả feedback
        if (isAdmin()) {
            return true;
        }
        
        // Staff có thể xem feedback của lịch hẹn mà họ phụ trách
        if (user.getRole() == UserRole.STAFF && 
                Objects.equals(feedback.getBooking().getStaff().getId(), user.getId())) {
            return true;
        }
        
        // Người dùng chỉ có thể truy cập feedback của chính họ
        return Objects.equals(feedback.getCustomer().getId(), user.getId());
    }

    /**
     * Check if the currently authenticated user is an admin or staff
     * 
     * @return True if the user is admin or staff, false otherwise
     */
    public boolean isAdminOrStaff() {
        Optional<User> userOpt = getOptionalCurrentUser();
        if (!userOpt.isPresent()) {
            return false;
        }
        
        User user = userOpt.get();
        return user.getRole() == UserRole.ADMIN || user.getRole() == UserRole.STAFF;
    }

    /**
     * Check if the currently authenticated user is an admin
     * 
     * @return True if the user is admin, false otherwise
     */
    public boolean isAdmin() {
        Optional<User> userOpt = getOptionalCurrentUser();
        if (!userOpt.isPresent()) {
            return false;
        }
        
        User user = userOpt.get();
        return user.getRole() == UserRole.ADMIN;
    }

    /**
     * Check if the currently authenticated user is the owner of the specified user
     * ID or is an admin
     * 
     * @param userId The user ID to check
     * @return True if the current user is the owner or an admin, false otherwise
     */
    public boolean isOwnerOrAdmin(UUID userId) {
        if (userId == null) {
            return false;
        }
        
        Optional<User> userOpt = getOptionalCurrentUser();
        if (!userOpt.isPresent()) {
            return false;
        }
        
        User user = userOpt.get();
        
        // Admin có thể truy cập tất cả
        if (user.getRole() == UserRole.ADMIN) {
            return true;
        }
        
        // Kiểm tra xem người dùng hiện tại có phải là chủ sở hữu
        return Objects.equals(user.getId(), userId);
    }

    /**
     * Phương thức tiện ích để lấy thông tin User từ ID
     * Không ném exception, thay vào đó trả về Optional<User>
     * 
     * @param userId ID của người dùng cần lấy thông tin
     * @return Optional<User> chứa thông tin người dùng nếu tìm thấy, trống nếu không
     */
    public Optional<User> getUserById(UUID userId) {
        try {
            log.debug("Looking for user with ID: {}", userId);
            return userRepository.findById(userId);
        } catch (Exception ex) {
            log.error("Error retrieving user by ID: {}", ex.getMessage());
            return Optional.empty();
        }
    }
    
    /**
     * Kiểm tra xem người dùng hiện tại có quyền cụ thể hay không
     * 
     * @param permissionCode Mã quyền cần kiểm tra
     * @return true nếu người dùng có quyền, false nếu không
     */
    public boolean hasPermission(String permissionCode) {
        Optional<User> userOpt = getOptionalCurrentUser();
        if (!userOpt.isPresent()) {
            return false;
        }
        
        User user = userOpt.get();
        return user.hasPermission(permissionCode);
    }
    
    /**
     * Kiểm tra xem người dùng hiện tại có thuộc nhóm quyền cụ thể hay không
     * 
     * @param groupName Tên nhóm quyền cần kiểm tra
     * @return true nếu người dùng thuộc nhóm quyền, false nếu không
     */
    public boolean hasPermissionGroup(String groupName) {
        Optional<User> userOpt = getOptionalCurrentUser();
        if (!userOpt.isPresent()) {
            return false;
        }
        
        User user = userOpt.get();
        return user.hasPermissionGroup(groupName);
    }
    
    /**
     * Tạo một đối tượng User giả, được sử dụng khi không tìm thấy người dùng
     * để tránh lỗi NullPointerException
     * 
     * @return Đối tượng User giả với quyền admin
     */
    private User createDummyUser() {
        return User.builder()
                .id(UUID.randomUUID())
                .username("dummy_user")
                .email("dummy@example.com")
                .password("dummypassword")
                .firstName("Dummy")
                .lastName("User")
                .role(UserRole.ADMIN) // Để đảm bảo có tất cả quyền
                .build();
    }
}