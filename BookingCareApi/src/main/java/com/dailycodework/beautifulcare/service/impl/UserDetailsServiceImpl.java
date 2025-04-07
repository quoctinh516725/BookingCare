package com.dailycodework.beautifulcare.service.impl;

import com.dailycodework.beautifulcare.entity.User;
import com.dailycodework.beautifulcare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "userDetails", key = "#username", unless = "#result == null")
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        log.info("Attempting to load user: {}", username);
        
        try {
            // Nếu username có dạng UUID, tìm theo ID
            if (username != null && username.matches("[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}")) {
                log.info("Username appears to be a UUID, trying to find by ID");
                Optional<User> userById = userRepository.findByIdWithPermissionsFull(UUID.fromString(username));
                if (userById.isPresent()) {
                    User user = userById.get();
                    log.info("Found user by ID: {}, with {} permission groups", username, user.getPermissionGroups().size());
                    return user;
                }
            }
            
            // Sử dụng truy vấn tối ưu với JOIN FETCH để lấy tất cả dữ liệu liên quan trong 1 truy vấn
            Optional<User> user = userRepository.findByUsernameOrEmailWithPermissionsFull(username, username);
            
            if (user.isPresent()) {
                User foundUser = user.get();
                log.info("Found user {} with {} permission groups", username, foundUser.getPermissionGroups().size());
                return foundUser;
            }
            
            // Log chi tiết khi không tìm thấy user
            log.warn("Could not find user with identifier: {}", username);
            
            // Chỉ log số lượng người dùng khi cần debug
            if (log.isDebugEnabled()) {
                long userCount = userRepository.count();
                log.debug("Total users in the system: {}", userCount);
                
                if (userCount < 20) {
                    log.debug("Listing all usernames for debugging:");
                    userRepository.findAll().forEach(u -> 
                        log.debug("User in database: {} ({}), id={}", u.getUsername(), u.getEmail(), u.getId())
                    );
                }
            }
            
            throw new UsernameNotFoundException("User not found with username: " + username);
        } catch (UsernameNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error while loading user by username: {}", e.getMessage(), e);
            throw new UsernameNotFoundException("Error retrieving user: " + e.getMessage());
        }
    }
}