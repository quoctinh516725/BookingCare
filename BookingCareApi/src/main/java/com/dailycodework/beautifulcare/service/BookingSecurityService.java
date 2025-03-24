package com.dailycodework.beautifulcare.service;

import com.dailycodework.beautifulcare.entity.Booking;
import com.dailycodework.beautifulcare.entity.Specialist;
import com.dailycodework.beautifulcare.entity.User;
import com.dailycodework.beautifulcare.repository.BookingRepository;
import com.dailycodework.beautifulcare.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Service kiểm tra bảo mật cho các thao tác trên booking
 */
@Service
public class BookingSecurityService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    @Autowired
    public BookingSecurityService(BookingRepository bookingRepository, UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
    }

    /**
     * Kiểm tra xem người dùng hiện tại có phải là specialist được gán cho booking
     * không
     * 
     * @param bookingId ID của booking cần kiểm tra
     * @return true nếu người dùng hiện tại là specialist được gán cho booking
     */
    public boolean isAssignedSpecialist(String bookingId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        String currentUsername = authentication.getName();
        User currentUser = userRepository.findByUsername(currentUsername).orElse(null);
        if (currentUser == null) {
            return false;
        }

        Booking booking = bookingRepository.findById(bookingId).orElse(null);
        if (booking == null || booking.getSpecialist() == null) {
            return false;
        }

        Specialist specialist = booking.getSpecialist();
        return specialist.getUser().getId().equals(currentUser.getId());
    }

    /**
     * Kiểm tra xem người dùng hiện tại có phải là chủ sở hữu hoặc specialist được
     * gán cho booking không
     * 
     * @param bookingId ID của booking cần kiểm tra
     * @return true nếu người dùng hiện tại là chủ sở hữu hoặc specialist được gán
     */
    public boolean isOwnerOrAssignedSpecialist(String bookingId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        String currentUsername = authentication.getName();
        User currentUser = userRepository.findByUsername(currentUsername).orElse(null);
        if (currentUser == null) {
            return false;
        }

        Booking booking = bookingRepository.findById(bookingId).orElse(null);
        if (booking == null) {
            return false;
        }

        // Check if user is the customer who created the booking
        // Customer kế thừa từ User nên ID của Customer chính là ID của User
        if (booking.getCustomer() != null &&
                booking.getCustomer().getId().equals(currentUser.getId())) {
            return true;
        }

        // Check if user is the assigned specialist
        if (booking.getSpecialist() != null &&
                booking.getSpecialist().getUser() != null &&
                booking.getSpecialist().getUser().getId().equals(currentUser.getId())) {
            return true;
        }

        return false;
    }
}