package com.dailycodework.beautifulcare.service.impl;

import com.dailycodework.beautifulcare.dto.request.PermissionGroupRequest;
import com.dailycodework.beautifulcare.dto.request.PermissionRequest;
import com.dailycodework.beautifulcare.dto.response.PermissionGroupResponse;
import com.dailycodework.beautifulcare.dto.response.PermissionResponse;
import com.dailycodework.beautifulcare.entity.Permission;
import com.dailycodework.beautifulcare.entity.PermissionGroup;
import com.dailycodework.beautifulcare.entity.User;
import com.dailycodework.beautifulcare.exception.DuplicateResourceException;
import com.dailycodework.beautifulcare.exception.ResourceNotFoundException;
import com.dailycodework.beautifulcare.mapper.PermissionGroupMapper;
import com.dailycodework.beautifulcare.mapper.PermissionMapper;
import com.dailycodework.beautifulcare.repository.PermissionGroupRepository;
import com.dailycodework.beautifulcare.repository.PermissionRepository;
import com.dailycodework.beautifulcare.repository.UserRepository;
import com.dailycodework.beautifulcare.service.PermissionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.HashMap;
import java.util.ArrayList;

/**
 * Triển khai PermissionService interface
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PermissionServiceImpl implements PermissionService {
    private final PermissionRepository permissionRepository;
    private final PermissionGroupRepository permissionGroupRepository;
    private final UserRepository userRepository;
    private final PermissionMapper permissionMapper;
    private final PermissionGroupMapper permissionGroupMapper;

    @Override
    public List<PermissionResponse> getAllPermissions() {
        log.info("Getting all permissions");
        return permissionRepository.findAll().stream()
                .map(permissionMapper::toPermissionResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PermissionResponse getPermissionById(UUID id) {
        log.info("Getting permission by ID: {}", id);
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permission not found"));
        return permissionMapper.toPermissionResponse(permission);
    }

    @Override
    @Transactional
    public PermissionResponse createPermission(PermissionRequest request) {
        log.info("Creating new permission: {}", request.getName());
        
        // Kiểm tra trùng lặp tên và mã quyền
        if (permissionRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Permission name already exists");
        }
        
        if (permissionRepository.existsByCode(request.getCode())) {
            throw new DuplicateResourceException("Permission code already exists");
        }
        
        Permission permission = permissionMapper.toPermission(request);
        permission = permissionRepository.save(permission);
        
        log.info("Permission created successfully: {}", permission.getId());
        return permissionMapper.toPermissionResponse(permission);
    }

    @Override
    @Transactional
    public PermissionResponse updatePermission(UUID id, PermissionRequest request) {
        log.info("Updating permission with ID: {}", id);
        
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permission not found"));
        
        // Kiểm tra trùng lặp tên và mã quyền (chỉ khi khác với giá trị hiện tại)
        if (!permission.getName().equals(request.getName()) && 
                permissionRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Permission name already exists");
        }
        
        if (!permission.getCode().equals(request.getCode()) && 
                permissionRepository.existsByCode(request.getCode())) {
            throw new DuplicateResourceException("Permission code already exists");
        }
        
        permissionMapper.updatePermission(permission, request);
        permission = permissionRepository.save(permission);
        
        log.info("Permission updated successfully: {}", permission.getId());
        return permissionMapper.toPermissionResponse(permission);
    }

    @Override
    @Transactional
    public void deletePermission(UUID id) {
        log.info("Deleting permission with ID: {}", id);
        
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permission not found"));
        
        // Xóa quyền khỏi tất cả các nhóm quyền
        for (PermissionGroup group : permission.getGroups()) {
            group.getPermissions().remove(permission);
            permissionGroupRepository.save(group);
        }
        
        permissionRepository.delete(permission);
        log.info("Permission deleted successfully: {}", id);
    }

    @Override
    public List<PermissionGroupResponse> getAllPermissionGroups() {
        log.info("Getting all permission groups");
        return permissionGroupRepository.findAll().stream()
                .map(permissionGroupMapper::toPermissionGroupResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PermissionGroupResponse getPermissionGroupById(UUID id) {
        log.info("Getting permission group by ID: {}", id);
        PermissionGroup group = permissionGroupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permission group not found"));
        return permissionGroupMapper.toPermissionGroupResponse(group);
    }

    @Override
    @Transactional
    public PermissionGroupResponse createPermissionGroup(PermissionGroupRequest request) {
        log.info("Creating new permission group: {}", request.getName());
        
        // Kiểm tra trùng lặp tên nhóm quyền
        if (permissionGroupRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Permission group name already exists");
        }
        
        PermissionGroup group = permissionGroupMapper.toPermissionGroup(request);
        
        // Thêm các quyền vào nhóm nếu có
        if (request.getPermissionIds() != null && !request.getPermissionIds().isEmpty()) {
            for (UUID permissionId : request.getPermissionIds()) {
                Permission permission = permissionRepository.findById(permissionId)
                        .orElseThrow(() -> new ResourceNotFoundException("Permission not found with ID: " + permissionId));
                group.addPermission(permission);
            }
        }
        
        group = permissionGroupRepository.save(group);
        
        log.info("Permission group created successfully: {}", group.getId());
        return permissionGroupMapper.toPermissionGroupResponse(group);
    }

    @Override
    @Transactional
    public PermissionGroupResponse updatePermissionGroup(UUID id, PermissionGroupRequest request) {
        log.info("Updating permission group with ID: {}", id);
        
        // Kiểm tra xem nhóm quyền tồn tại không
        PermissionGroup group = permissionGroupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permission group not found"));
        
        // Kiểm tra xem tên mới có trùng với nhóm khác không
        if (!group.getName().equals(request.getName()) && 
            permissionGroupRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Permission group already exists with name: " + request.getName());
        }
        
        // Cập nhật thông tin cơ bản
        permissionGroupMapper.updatePermissionGroup(group, request);
        
        // Cập nhật danh sách quyền nếu có
        if (request.getPermissionIds() != null && !request.getPermissionIds().isEmpty()) {
            // Xóa tất cả quyền hiện tại
            group.getPermissions().clear();
            
            // Thêm các quyền mới
            for (UUID permissionId : request.getPermissionIds()) {
                Permission permission = permissionRepository.findById(permissionId)
                        .orElseThrow(() -> new ResourceNotFoundException("Permission not found with ID: " + permissionId));
                group.addPermission(permission);
            }
        }
        
        // Lưu nhóm quyền
        final PermissionGroup updatedGroup = permissionGroupRepository.save(group);
        
        // Cập nhật permissionsUpdatedAt cho tất cả user trong nhóm
        updateUsersPermissionsTimestamp(group);
        
        log.info("Permission group updated successfully: {}", updatedGroup.getId());
        return permissionGroupMapper.toPermissionGroupResponse(updatedGroup);
    }

    @Override
    @Transactional
    public void deletePermissionGroup(UUID id) {
        log.info("Deleting permission group with ID: {}", id);
        
        PermissionGroup group = permissionGroupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permission group not found"));
        
        // Xóa nhóm quyền khỏi tất cả người dùng
        for (User user : group.getUsers()) {
            user.getPermissionGroups().remove(group);
            userRepository.save(user);
        }
        
        permissionGroupRepository.delete(group);
        log.info("Permission group deleted successfully: {}", id);
    }

    @Override
    @Transactional
    public PermissionGroupResponse addPermissionToGroup(UUID groupId, UUID permissionId) {
        log.info("Adding permission {} to group {}", permissionId, groupId);
        
        PermissionGroup group = permissionGroupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Permission group not found"));
        
        Permission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Permission not found"));
        
        // Kiểm tra xem quyền đã có trong nhóm chưa
        if (group.getPermissions().contains(permission)) {
            log.info("Permission already exists in group");
            return permissionGroupMapper.toPermissionGroupResponse(group);
        }
        
        group.addPermission(permission);
        group = permissionGroupRepository.save(group);
        
        // Cập nhật permissionsUpdatedAt cho tất cả user trong nhóm
        updateUsersPermissionsTimestamp(group);
        
        log.info("Permission added to group successfully");
        return permissionGroupMapper.toPermissionGroupResponse(group);
    }

    @Override
    @Transactional
    public PermissionGroupResponse removePermissionFromGroup(UUID groupId, UUID permissionId) {
        log.info("Removing permission {} from group {}", permissionId, groupId);
        
        PermissionGroup group = permissionGroupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Permission group not found"));
        
        Permission permission = permissionRepository.findById(permissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Permission not found"));
        
        // Kiểm tra xem quyền có trong nhóm không
        if (!group.getPermissions().contains(permission)) {
            log.info("Permission not found in group");
            return permissionGroupMapper.toPermissionGroupResponse(group);
        }
        
        group.removePermission(permission);
        group = permissionGroupRepository.save(group);
        
        // Cập nhật permissionsUpdatedAt cho tất cả user trong nhóm
        updateUsersPermissionsTimestamp(group);
        
        log.info("Permission removed from group successfully");
        return permissionGroupMapper.toPermissionGroupResponse(group);
    }

    @Override
    @Transactional
    public void assignPermissionGroupToUser(UUID userId, UUID groupId) {
        log.info("Assigning permission group {} to user {}", groupId, userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        PermissionGroup group = permissionGroupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Permission group not found"));
        
        // Kiểm tra xem người dùng đã có nhóm quyền này chưa
        if (user.getPermissionGroups().contains(group)) {
            log.info("User already has this permission group");
            return;
        }
        
        // Lưu trạng thái ban đầu để so sánh
        int initialGroupCount = user.getPermissionGroups().size();
        
        // Thực hiện gán quyền
        user.addPermissionGroup(group);
        user.setPermissionsUpdatedAt(LocalDateTime.now());
        User savedUser = userRepository.save(user);
        log.info("Permission group assigned to user, saving changes");
        
        // Flush để đảm bảo các thay đổi được ghi vào cơ sở dữ liệu
        userRepository.flush();
        
        // Xác nhận lại quyền đã được gán bằng cách nạp lại user từ cơ sở dữ liệu
        User refreshedUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found after save operation"));
        
        boolean permissionAssigned = false;
        for (PermissionGroup pg : refreshedUser.getPermissionGroups()) {
            if (pg.getId().equals(groupId)) {
                permissionAssigned = true;
                break;
            }
        }
        
        if (!permissionAssigned) {
            log.error("Failed to assign permission group {} to user {}. Database state is inconsistent.", groupId, userId);
            throw new RuntimeException("Failed to assign permission group. Please try again.");
        }
        
        int newGroupCount = refreshedUser.getPermissionGroups().size();
        if (newGroupCount <= initialGroupCount) {
            log.warn("Permission group count did not increase after assignment operation. Initial: {}, New: {}", 
                    initialGroupCount, newGroupCount);
        }
        
        log.info("Permission group assigned to user successfully and verified");
    }

    @Override
    @Transactional
    public void removePermissionGroupFromUser(UUID userId, UUID groupId) {
        log.info("Removing permission group from user: userId={}, groupId={}", userId, groupId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
                
        PermissionGroup group = permissionGroupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Permission group not found with ID: " + groupId));
        
        // Kiểm tra xem người dùng có nhóm quyền này không
        if (!user.getPermissionGroups().contains(group)) {
            throw new IllegalStateException("User does not have this permission group: " + group.getName());
        }
        
        // Gỡ bỏ nhóm quyền
        user.removePermissionGroup(group);
        user.setPermissionsUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        
        log.info("Permission group removed from user successfully");
    }

    @Override
    public List<UUID> getUserPermissionGroups(UUID userId) {
        log.info("Fetching permission groups for user: {}", userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        return user.getPermissionGroups().stream()
                .map(PermissionGroup::getId)
                .collect(Collectors.toList());
    }
    
    @Override
    public Map<UUID, List<UUID>> getAllUserPermissionGroups() {
        log.info("Fetching permission groups for all users");
        
        // Lấy tất cả người dùng
        List<User> users = userRepository.findAll();
        
        // Tạo map để lưu trữ kết quả
        Map<UUID, List<UUID>> result = new HashMap<>();
        
        // Lấy quyền cho mỗi người dùng
        for (User user : users) {
            List<UUID> permissionGroupIds = user.getPermissionGroups().stream()
                    .map(PermissionGroup::getId)
                    .collect(Collectors.toList());
            
            result.put(user.getId(), permissionGroupIds);
        }
        
        log.info("Fetched permission groups for {} users", users.size());
        return result;
    }

    /**
     * Cập nhật thời gian cập nhật quyền cho tất cả user trong nhóm
     * @param group Nhóm quyền
     */
    private void updateUsersPermissionsTimestamp(PermissionGroup group) {
        log.debug("Updating permissions timestamp for users in group: {}", group.getName());
        
        for (User user : group.getUsers()) {
            user.setPermissionsUpdatedAt(LocalDateTime.now());
            userRepository.save(user);
            log.debug("Updated permissions timestamp for user: {}", user.getUsername());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasPermission(String username, String permissionCode) {
        log.debug("Checking permission for user: {}, permission: {}", username, permissionCode);
        
        try {
            // Tìm người dùng theo username và tải eager các nhóm quyền
            User user = userRepository.findByUsernameWithPermissionGroups(username)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
            
            log.debug("Found user: {}, role: {}", user.getUsername(), user.getRole().name());
            
            // Kiểm tra xem người dùng có quyền ADMIN không
            if (user.getRole().name().equals("ADMIN")) {
                log.debug("User is ADMIN, granting all permissions");
                return true;
            }
            
            // Log số lượng nhóm quyền của user
            log.debug("User has {} permission groups", user.getPermissionGroups().size());
            
            // Tải eager các quyền cho mỗi nhóm quyền
            for (PermissionGroup group : user.getPermissionGroups()) {
                log.debug("Checking permission group: {}", group.getName());
                
                PermissionGroup loadedGroup = permissionGroupRepository.findByIdWithPermissions(group.getId())
                        .orElseThrow(() -> new ResourceNotFoundException("Permission group not found: " + group.getId()));
                
                // Log số lượng quyền trong nhóm
                log.debug("Permission group {} has {} permissions", group.getName(), loadedGroup.getPermissions().size());
                
                for (Permission permission : loadedGroup.getPermissions()) {
                    log.debug("Checking permission: {} against required: {}", permission.getCode(), permissionCode);
                    if (permission.getCode().equals(permissionCode)) {
                        log.debug("Permission found in user's permission groups");
                        return true;
                    }
                }
            }
            
            log.debug("Permission not found for user");
            return false;
        } catch (Exception e) {
            log.error("Error checking permission: {}", e.getMessage(), e);
            return false;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getUserPermissionInfo(String username) {
        log.debug("Getting permission info for user: {}", username);
        
        Map<String, Object> result = new HashMap<>();
        
        // Tìm người dùng theo username và tải eager các nhóm quyền
        User user = userRepository.findByUsernameWithPermissionGroups(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        
        result.put("username", user.getUsername());
        result.put("role", user.getRole().name());
        
        // Lấy danh sách các nhóm quyền và quyền của user
        List<Map<String, Object>> permissionGroups = new ArrayList<>();
        for (PermissionGroup group : user.getPermissionGroups()) {
            PermissionGroup loadedGroup = permissionGroupRepository.findByIdWithPermissions(group.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Permission group not found: " + group.getId()));
            
            Map<String, Object> groupInfo = new HashMap<>();
            groupInfo.put("groupId", loadedGroup.getId());
            groupInfo.put("groupName", loadedGroup.getName());
            
            List<String> permissions = loadedGroup.getPermissions().stream()
                    .map(Permission::getCode)
                    .collect(Collectors.toList());
            groupInfo.put("permissions", permissions);
            
            permissionGroups.add(groupInfo);
        }
        
        result.put("permissionGroups", permissionGroups);
        
        // Log thông tin quyền
        log.debug("User permission info: {}", result);
        
        return result;
    }
} 