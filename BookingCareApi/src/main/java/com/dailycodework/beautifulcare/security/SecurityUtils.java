package com.dailycodework.beautifulcare.security;

import com.dailycodework.beautifulcare.entity.Booking;
import com.dailycodework.beautifulcare.entity.Feedback;
import com.dailycodework.beautifulcare.entity.User;
import com.dailycodework.beautifulcare.entity.UserRole;
import com.dailycodework.beautifulcare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

import java.util.Objects;

/**
 * Utility class for security operations like retrieving current user
 * and checking access permissions
 */
@Component
@RequiredArgsConstructor
public class SecurityUtils {

    private final UserRepository userRepository;

    /**
     * Get the currently authenticated user
     * 
     * @return The authenticated user
     * @throws UsernameNotFoundException if no authenticated user found
     */
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new UsernameNotFoundException("No authenticated user found");
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + authentication.getName()));
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
        User currentUser = getCurrentUser();

        // Admin and staff can access all bookings
        if (currentUser.getRole() == UserRole.ADMIN || currentUser.getRole() == UserRole.STAFF) {
            return true;
        }

        // Customers can only access their own bookings
        return Objects.equals(booking.getCustomer().getId(), currentUser.getId());
    }

    /**
     * Check if the currently authenticated user has access to the feedback
     * Admin can access all feedback, customers can only access their own feedback
     * 
     * @param feedback The feedback to check
     * @return True if the user has access, false otherwise
     */
    public boolean hasFeedbackAccess(Feedback feedback) {
        User currentUser = getCurrentUser();

        // Admin can access all feedback
        if (currentUser.getRole() == UserRole.ADMIN) {
            return true;
        }

        // Customers can only access their own feedback
        return Objects.equals(feedback.getCustomer().getId(), currentUser.getId());
    }

    /**
     * Check if the currently authenticated user is an admin or staff
     * 
     * @return True if the user is admin or staff, false otherwise
     */
    public boolean isAdminOrStaff() {
        User currentUser = getCurrentUser();
        return currentUser.getRole() == UserRole.ADMIN || currentUser.getRole() == UserRole.STAFF;
    }

    /**
     * Check if the currently authenticated user is an admin
     * 
     * @return True if the user is admin, false otherwise
     */
    public boolean isAdmin() {
        User currentUser = getCurrentUser();
        return currentUser.getRole() == UserRole.ADMIN;
    }

    /**
     * Check if the currently authenticated user is the owner of the specified user
     * ID
     * 
     * @param userId The user ID to check
     * @return True if the current user is the owner or an admin, false otherwise
     */
    public boolean isOwnerOrAdmin(java.util.UUID userId) {
        User currentUser = getCurrentUser();
        return currentUser.getRole() == UserRole.ADMIN ||
                Objects.equals(currentUser.getId(), userId);
    }
}