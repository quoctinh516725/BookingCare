package com.dailycodework.beautifulcare.service;

import com.dailycodework.beautifulcare.dto.request.PasswordChangeRequest;
import com.dailycodework.beautifulcare.dto.request.UserRequest;
import com.dailycodework.beautifulcare.dto.request.UserUpdateRequest;
import com.dailycodework.beautifulcare.dto.response.UserResponse;

import java.util.List;
import java.util.UUID;

public interface UserService {
    List<UserResponse> getAllUsers();

    UserResponse getUserById(UUID id);

    UserResponse createUser(UserRequest request);

    UserResponse updateUser(UUID id, UserRequest request);

    UserResponse updateUser(UUID id, UserUpdateRequest request);

    void deleteUser(UUID id);
    
    void changePassword(UUID id, PasswordChangeRequest request);
}
