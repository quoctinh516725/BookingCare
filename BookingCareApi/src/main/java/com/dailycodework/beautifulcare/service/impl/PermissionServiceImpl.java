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

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

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
        
        user.addPermissionGroup(group);
        userRepository.save(user);
        
        log.info("Permission group assigned to user successfully");
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
        userRepository.save(user);
        
        log.info("Permission group removed from user successfully");
    }

    @Override
    public List<UUID> getUserPermissionGroups(UUID userId) {
        log.info("Getting permission groups for user with ID: {}", userId);
        
        // Kiểm tra xem người dùng tồn tại không
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with ID: " + userId);
        }
        
        // Lấy danh sách nhóm quyền từ repository
        List<PermissionGroup> groups = permissionGroupRepository.findByUserId(userId);
        
        // Trả về danh sách ID
        List<UUID> groupIds = groups.stream()
                .map(PermissionGroup::getId)
                .collect(Collectors.toList());
                
        log.info("Found {} permission groups for user", groupIds.size());
        return groupIds;
    }
} 