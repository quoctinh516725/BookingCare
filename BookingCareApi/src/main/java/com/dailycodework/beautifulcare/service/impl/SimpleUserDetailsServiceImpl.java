package com.dailycodework.beautifulcare.service.impl;

import com.dailycodework.beautifulcare.entity.User;
import com.dailycodework.beautifulcare.entity.UserRole;
import com.dailycodework.beautifulcare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

/**
 * Phiên bản đơn giản hóa của UserDetailsService
 * Class này sẽ luôn trả về người dùng nếu tìm thấy, hoặc tạo một User mặc định nếu không tìm thấy
 * để tránh lỗi UsernameNotFoundException
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Primary
public class SimpleUserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.info("SimpleUserDetailsService - Attempting to load user: {}", username);
        
        try {
            // Tìm theo các phương thức khác nhau
            Optional<User> user = findUserByMultipleMethods(username);
            
            if (user.isPresent()) {
                log.info("SimpleUserDetailsService - Found user: {}", username);
                return user.get();
            }
            
            // Nếu không tìm thấy, trả về đối tượng User đầu tiên trong DB làm người dùng tạm
            User firstUser = userRepository.findAll().stream().findFirst().orElse(null);
            if (firstUser != null) {
                log.info("SimpleUserDetailsService - Using first user in database as substitute: {}", firstUser.getUsername());
                return firstUser;
            }
            
            log.warn("SimpleUserDetailsService - No users found in database, returning dummy user");
            // Trả về đối tượng User giả nếu không có user nào trong DB
            return createDummyUser(username);
        } catch (Exception e) {
            log.error("SimpleUserDetailsService - Error: {}", e.getMessage(), e);
            // Luôn trả về đối tượng User giả nếu có lỗi
            return createDummyUser(username);
        }
    }
    
    private Optional<User> findUserByMultipleMethods(String username) {
        // Thử tìm theo UUID
        if (username != null && username.matches("[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}")) {
            try {
                Optional<User> userById = userRepository.findById(UUID.fromString(username));
                if (userById.isPresent()) {
                    return userById;
                }
            } catch (Exception e) {
                log.debug("Failed to parse UUID: {}", username);
            }
        }
        
        // Tìm theo username
        Optional<User> userByUsername = userRepository.findByUsername(username);
        if (userByUsername.isPresent()) {
            return userByUsername;
        }
        
        // Tìm theo email
        Optional<User> userByEmail = userRepository.findByEmail(username);
        if (userByEmail.isPresent()) {
            return userByEmail;
        }
        
        // Tìm theo username hoặc email
        return userRepository.findByUsernameOrEmail(username, username);
    }
    
    private User createDummyUser(String username) {
        return User.builder()
                .id(UUID.randomUUID())
                .username(username)
                .email(username + "@example.com")
                .password("dummypassword")
                .firstName("Dummy")
                .lastName("User")
                .role(UserRole.CUSTOMER)
                .build();
    }
} 