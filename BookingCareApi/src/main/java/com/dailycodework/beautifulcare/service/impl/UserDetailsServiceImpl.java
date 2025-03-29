package com.dailycodework.beautifulcare.service.impl;

import com.dailycodework.beautifulcare.entity.User;
import com.dailycodework.beautifulcare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Tìm user theo username hoặc email
        log.info("Attempting to load user: {}", username);
        
        // Đối với bất kỳ username nào, ghi log chi tiết
        try {
            // Thử tìm kiếm theo UUID để debug (nếu username có dạng UUID)
            if (username != null && username.matches("[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}")) {
                log.info("Username appears to be a UUID, trying to find by ID");
                Optional<User> userById = userRepository.findById(UUID.fromString(username));
                if (userById.isPresent()) {
                    log.info("Found user by ID: {}", username);
                    return userById.get();
                }
            }
            
            // Tìm theo username
            Optional<User> userByUsername = userRepository.findByUsername(username);
            if (userByUsername.isPresent()) {
                log.info("Found user by username: {}", username);
                return userByUsername.get();
            }
            
            // Tìm theo email
            Optional<User> userByEmail = userRepository.findByEmail(username);
            if (userByEmail.isPresent()) {
                log.info("Found user by email: {}", username);
                return userByEmail.get();
            }
            
            // Tìm theo username hoặc email
            Optional<User> userByUsernameOrEmail = userRepository.findByUsernameOrEmail(username, username);
            if (userByUsernameOrEmail.isPresent()) {
                log.info("Found user by either username or email: {}", username);
                return userByUsernameOrEmail.get();
            }
            
            // Ghi log chi tiết về tìm kiếm
            log.warn("Could not find user with identifier: {}. SQL queries executed.", username);
            
            // Ghi log số lượng người dùng trong hệ thống để debug
            long userCount = userRepository.count();
            log.info("Total users in the system: {}", userCount);
            
            if (userCount < 20) { // Chỉ log tất cả người dùng nếu số lượng không quá lớn
                log.info("Listing all usernames for debugging:");
                userRepository.findAll().forEach(user -> 
                    log.info("User in database: {} ({}), id={}", user.getUsername(), user.getEmail(), user.getId())
                );
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