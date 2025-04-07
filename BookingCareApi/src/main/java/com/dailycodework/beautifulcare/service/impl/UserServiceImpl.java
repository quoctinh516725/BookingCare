package com.dailycodework.beautifulcare.service.impl;

import com.dailycodework.beautifulcare.dto.request.UserRequest;
import com.dailycodework.beautifulcare.dto.request.UserUpdateRequest;
import com.dailycodework.beautifulcare.dto.response.UserResponse;
import com.dailycodework.beautifulcare.entity.User;
import com.dailycodework.beautifulcare.entity.UserRole;
import com.dailycodework.beautifulcare.exception.ResourceNotFoundException;
import com.dailycodework.beautifulcare.mapper.UserMapper;
import com.dailycodework.beautifulcare.repository.UserRepository;
import com.dailycodework.beautifulcare.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.dailycodework.beautifulcare.dto.request.PasswordChangeRequest;
import com.dailycodework.beautifulcare.exception.BadRequestException;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "allUsers")
    public List<UserResponse> getAllUsers() {
        log.info("Getting all users with permission groups");
        // Sử dụng phương thức tải eager tất cả người dùng cùng với nhóm quyền
        return userRepository.findAllWithPermissionGroups().stream()
                .map(userMapper::toUserResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "usersByRole", key = "#role.name()")
    public List<UserResponse> getUsersByRole(UserRole role) {
        log.info("Getting users by role with permission groups: {}", role);
        // Sử dụng phương thức tải eager người dùng theo vai trò cùng với nhóm quyền
        return userRepository.findByRoleWithPermissionGroups(role).stream()
                .map(userMapper::toUserResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "userById", key = "#id")
    public UserResponse getUserById(UUID id) {
        log.info("Getting user by ID with permission groups: {}", id);
        // Sử dụng phương thức tối ưu để lấy tất cả dữ liệu trong một truy vấn
        User user = userRepository.findByIdWithPermissionsFull(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        log.info("Found user with username: {}, email: {}, permission groups: {}", 
                user.getUsername(), user.getEmail(), user.getPermissionGroups().size());
        
        return userMapper.toUserResponse(user);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"allUsers", "userById", "usersByRole", "userDetails"}, allEntries = true)
    public UserResponse createUser(UserRequest request) {
        // Ghi log và kiểm tra dữ liệu đầu vào
        log.info("Creating user with email: {}", request.getEmail());
        
        // Kiểm tra mật khẩu
        if (request.getPassword() == null || request.getPassword().isEmpty()) {
            log.error("Password is null or empty in the request");
            throw new IllegalArgumentException("Password cannot be null or empty");
        }
        
        User user = userMapper.toUser(request);
        
        // Mã hóa mật khẩu
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        // Tạo username từ email nếu không có
        if (user.getUsername() == null || user.getUsername().isEmpty()) {
            user.setUsername(request.getEmail().split("@")[0]);
        }
        
        User savedUser = userRepository.save(user);
        log.info("User created successfully with ID: {}", savedUser.getId());
        
        // Tải lại người dùng với đầy đủ quyền
        User loadedUser = userRepository.findByIdWithPermissionsFull(savedUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found after saving"));
        
        return userMapper.toUserResponse(loadedUser);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"allUsers", "userById", "usersByRole", "userDetails"}, allEntries = true)
    public UserResponse updateUser(UUID id, UserRequest request) {
        User user = userRepository.findByIdWithPermissionsFull(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        userMapper.updateUser(user, request);
        User savedUser = userRepository.save(user);
        
        // Không cần tải lại vì chúng ta đã tải đầy đủ dữ liệu từ truy vấn ban đầu
        return userMapper.toUserResponse(savedUser);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"allUsers", "userById", "usersByRole", "userDetails"}, allEntries = true)
    public UserResponse updateUser(UUID id, UserUpdateRequest request) {
        log.info("Updating user with ID: {}", id);
        
        // Tìm user theo ID với tất cả dữ liệu liên quan
        User user = userRepository.findByIdWithPermissionsFull(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // Cập nhật thông tin
        if (request.getEmail() != null) {
            user.setEmail(request.getEmail());
        }
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getDescription() != null) {
            user.setDescription(request.getDescription());
        }
        if (request.getRole() != null) {
            try {
                UserRole role = UserRole.valueOf(request.getRole());
                user.setRole(role);
            } catch (IllegalArgumentException e) {
                log.error("Invalid role: {}", request.getRole());
                throw new BadRequestException("Invalid role: " + request.getRole());
            }
        }
        
        // Lưu và trả về kết quả
        User savedUser = userRepository.save(user);
        log.info("User updated successfully: {}", savedUser.getId());
        
        // Không cần tải lại vì chúng ta đã tải đầy đủ dữ liệu từ truy vấn ban đầu
        return userMapper.toUserResponse(savedUser);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"allUsers", "userById", "usersByRole", "userDetails"}, allEntries = true)
    public void deleteUser(UUID id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User not found");
        }
        userRepository.deleteById(id);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"userById", "userDetails"}, key = "#id")
    public void changePassword(UUID id, PasswordChangeRequest request) {
        log.info("Changing password for user ID: {}", id);
        
        // Tìm user theo ID với eager loading quyền
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        // Kiểm tra mật khẩu hiện tại
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }
        
        // Cập nhật mật khẩu mới
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password changed successfully for user ID: {}", id);
    }
}