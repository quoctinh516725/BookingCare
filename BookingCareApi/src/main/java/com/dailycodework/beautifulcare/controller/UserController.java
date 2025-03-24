package com.dailycodework.beautifulcare.controller;

import com.dailycodework.beautifulcare.dto.request.UserCreateRequest;
import com.dailycodework.beautifulcare.dto.request.UserUpdateRequest;
import com.dailycodework.beautifulcare.dto.response.ApiResponse;
import com.dailycodework.beautifulcare.dto.response.UserResponse;
import com.dailycodework.beautifulcare.service.UserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @deprecated This controller is deprecated and will be removed in a future
 *             release.
 *             Please use {@link UserManagementController} instead.
 */
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Slf4j
@Deprecated(forRemoval = true)
@Tag(name = "Users (Deprecated)", description = "Deprecated API for user management. Use /api/v1/users instead.")
public class UserController {
    private final UserService userService;

    @PostMapping
    @Deprecated
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@Valid @RequestBody UserCreateRequest request) {
        log.info("REST request to create a new user (deprecated)");
        UserResponse createdUser = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User created successfully", createdUser));
    }

    @GetMapping
    @Deprecated
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        log.info("REST request to get all users (deprecated)");
        List<UserResponse> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", users));
    }

    @GetMapping("/{userId}")
    @Deprecated
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable("userId") String userId) {
        log.info("REST request to get user by id: {} (deprecated)", userId);
        UserResponse user = userService.getUserById(userId);
        return ResponseEntity.ok(ApiResponse.success("User retrieved successfully", user));
    }

    @PutMapping("/{userId}")
    @Deprecated
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable String userId,
            @Valid @RequestBody UserUpdateRequest request) {
        log.info("REST request to update user with id: {} (deprecated)", userId);
        UserResponse updatedUser = userService.updateUser(userId, request);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", updatedUser));
    }

    @DeleteMapping("/{userId}")
    @Deprecated
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable String userId) {
        log.info("REST request to delete user with id: {} (deprecated)", userId);
        userService.deleteUser(userId);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }
}
