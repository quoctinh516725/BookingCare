package com.dailycodework.beautifulcare.controller;

import com.dailycodework.beautifulcare.dto.request.UserRequest;
import com.dailycodework.beautifulcare.dto.request.UserUpdateRequest;
import com.dailycodework.beautifulcare.dto.request.PasswordChangeRequest;
import com.dailycodework.beautifulcare.dto.response.UserResponse;
import com.dailycodework.beautifulcare.entity.User;
import com.dailycodework.beautifulcare.entity.UserRole;
import com.dailycodework.beautifulcare.exception.ResourceNotFoundException;
import com.dailycodework.beautifulcare.exception.BadRequestException;
import com.dailycodework.beautifulcare.security.HasPermission;
import com.dailycodework.beautifulcare.security.SecurityUtils;
import com.dailycodework.beautifulcare.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.Map;

/**
 * @deprecated This controller is deprecated and will be removed in a future
 *             release.
 *             Please use {@link UserManagementController} instead.
 */
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User", description = "User management APIs")
@Slf4j
public class UserController {
    private final UserService userService;
    private final SecurityUtils securityUtils;

    @GetMapping
    @Operation(summary = "Get all users")
    @HasPermission("user:view")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/staff")
    @Operation(summary = "Get all staff members")
    @HasPermission("user:view")
    public ResponseEntity<List<UserResponse>> getAllStaff() {
        return ResponseEntity.ok(userService.getUsersByRole(UserRole.STAFF));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID")
    @HasPermission("user:view")
    public ResponseEntity<UserResponse> getUserById(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping
    @Operation(summary = "Create new user")
    @HasPermission("user:create")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserRequest request) {
        return ResponseEntity.ok(userService.createUser(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update user")
    @HasPermission("user:update")
    public ResponseEntity<?> updateUser(
            @PathVariable UUID id,
            @Valid @RequestBody UserUpdateRequest request) {
        
        log.info("Received request to update user with ID: {}", id);
        
        try {
            // Cập nhật người dùng theo ID
            UserResponse updatedUser = userService.updateUser(id, request);
            log.info("User updated successfully: {}", id);
            
            return ResponseEntity.ok(updatedUser);
        } catch (ResourceNotFoundException ex) {
            log.error("User not found with ID: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "User not found", "error", ex.getMessage()));
        } catch (BadRequestException ex) {
            log.error("Bad request error: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", "Invalid request", "error", ex.getMessage()));
        } catch (Exception ex) {
            log.error("Error updating user: {}", ex.getMessage(), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "message", "Failed to update user", 
                    "error", ex.getMessage(),
                    "errorType", ex.getClass().getSimpleName()
                ));
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete user")
    @HasPermission("user:delete")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/change-password")
    @Operation(summary = "Change user password")
    @HasPermission("user:update")
    public ResponseEntity<?> changePassword(
            @PathVariable UUID id,
            @Valid @RequestBody PasswordChangeRequest request) {
        
        log.info("Received request to change password for user with ID: {}", id);
        
        try {
            // Thay đổi mật khẩu
            userService.changePassword(id, request);
            log.info("Password changed successfully for ID: {}", id);
            
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (ResourceNotFoundException ex) {
            log.error("User not found with ID: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "User not found", "error", ex.getMessage()));
        } catch (BadRequestException ex) {
            log.error("Bad request error: {}", ex.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", "Invalid request", "error", ex.getMessage()));
        } catch (Exception ex) {
            log.error("Error changing password: {}", ex.getMessage(), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "message", "Failed to change password", 
                    "error", ex.getMessage(),
                    "errorType", ex.getClass().getSimpleName()
                ));
        }
    }
}
