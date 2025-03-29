package com.dailycodework.beautifulcare.mapper;

import com.dailycodework.beautifulcare.dto.request.RegisterRequest;
import com.dailycodework.beautifulcare.dto.request.UserRequest;
import com.dailycodework.beautifulcare.dto.response.UserResponse;
import com.dailycodework.beautifulcare.entity.User;
import com.dailycodework.beautifulcare.entity.UserRole;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implement custom của UserMapper để cung cấp chức năng debug
 * Lớp này sẽ được ưu tiên hơn lớp do MapStruct tạo ra
 */
@Component
@Slf4j
public class UserMapperImpl implements UserMapper {

    @Override
    public User toUser(RegisterRequest request) {
        if (request == null) {
            log.warn("RegisterRequest is null");
            return null;
        }
        
        log.debug("Mapping RegisterRequest to User: {}", request);
        
        User user = User.builder()
                .email(request.getEmail())
                .username(request.getUsername())
                .password(request.getPassword())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .role(request.getRole() != null ? UserRole.valueOf(request.getRole().toUpperCase()) : UserRole.CUSTOMER)
                .build();
        
        log.debug("Mapped User from RegisterRequest: {}", user);
        return user;
    }

    @Override
    public User toUser(UserRequest request) {
        if (request == null) {
            log.warn("UserRequest is null");
            return null;
        }
        
        log.debug("Mapping UserRequest to User: {}", request);
        
        User user = User.builder()
                .email(request.getEmail())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .role(request.getRole() != null ? UserRole.valueOf(request.getRole().toUpperCase()) : UserRole.CUSTOMER)
                .build();
        
        log.debug("Mapped User from UserRequest: {}", user);
        return user;
    }

    @Override
    public void updateUser(User user, UserRequest request) {
        if (user == null || request == null) {
            log.warn("User or UserRequest is null");
            return;
        }
        
        log.debug("Updating User with UserRequest: User={}, Request={}", user, request);
        
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
        if (request.getRole() != null) {
            user.setRole(UserRole.valueOf(request.getRole().toUpperCase()));
        }
        
        log.debug("Updated User: {}", user);
    }

    @Override
    public UserResponse toUserResponse(User user) {
        if (user == null) {
            log.warn("User is null");
            return null;
        }
        
        log.debug("Mapping User to UserResponse: {}", user);
        
        String fullName = (user.getFirstName() != null ? user.getFirstName() : "") + " " + 
                         (user.getLastName() != null ? user.getLastName() : "");
        fullName = fullName.trim();
        
        UserResponse response = UserResponse.builder()
                .id(user.getId())
                .username(user.getUsernameValue())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(fullName)
                .phoneNumber(user.getPhone())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
        
        log.debug("Mapped UserResponse from User: {}", response);
        return response;
    }

    @Override
    public List<UserResponse> toUserResponses(List<User> users) {
        if (users == null) {
            log.warn("Users list is null");
            return null;
        }
        
        log.debug("Mapping list of {} Users to UserResponses", users.size());
        
        List<UserResponse> responses = users.stream()
                .map(this::toUserResponse)
                .collect(Collectors.toList());
        
        log.debug("Mapped {} UserResponses", responses.size());
        return responses;
    }
} 