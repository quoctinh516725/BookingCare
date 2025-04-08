package com.dailycodework.beautifulcare.service;

import com.dailycodework.beautifulcare.dto.request.PermissionGroupRequest;
import com.dailycodework.beautifulcare.dto.request.PermissionRequest;
import com.dailycodework.beautifulcare.dto.response.PermissionGroupResponse;
import com.dailycodework.beautifulcare.dto.response.PermissionResponse;
import com.dailycodework.beautifulcare.entity.Permission;
import com.dailycodework.beautifulcare.entity.PermissionGroup;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface PermissionService {
    /**
     * Lấy danh sách tất cả các quyền
     * @return Danh sách các quyền
     */
    List<PermissionResponse> getAllPermissions();
    
    /**
     * Lấy thông tin quyền theo ID
     * @param id ID của quyền
     * @return Thông tin quyền
     */
    PermissionResponse getPermissionById(UUID id);
    
    /**
     * Tạo quyền mới
     * @param request Thông tin quyền cần tạo
     * @return Thông tin quyền đã tạo
     */
    PermissionResponse createPermission(PermissionRequest request);
    
    /**
     * Cập nhật thông tin quyền
     * @param id ID của quyền
     * @param request Thông tin cập nhật
     * @return Thông tin quyền đã cập nhật
     */
    PermissionResponse updatePermission(UUID id, PermissionRequest request);
    
    /**
     * Xóa quyền
     * @param id ID của quyền cần xóa
     */
    void deletePermission(UUID id);
    
    /**
     * Lấy danh sách tất cả các nhóm quyền
     * @return Danh sách các nhóm quyền
     */
    List<PermissionGroupResponse> getAllPermissionGroups();
    
    /**
     * Lấy thông tin nhóm quyền theo ID
     * @param id ID của nhóm quyền
     * @return Thông tin nhóm quyền
     */
    PermissionGroupResponse getPermissionGroupById(UUID id);
    
    /**
     * Tạo nhóm quyền mới
     * @param request Thông tin nhóm quyền cần tạo
     * @return Thông tin nhóm quyền đã tạo
     */
    PermissionGroupResponse createPermissionGroup(PermissionGroupRequest request);
    
    /**
     * Cập nhật thông tin nhóm quyền
     * @param id ID của nhóm quyền
     * @param request Thông tin cập nhật
     * @return Thông tin nhóm quyền đã cập nhật
     */
    PermissionGroupResponse updatePermissionGroup(UUID id, PermissionGroupRequest request);
    
    /**
     * Xóa nhóm quyền
     * @param id ID của nhóm quyền cần xóa
     */
    void deletePermissionGroup(UUID id);
    
    /**
     * Thêm quyền vào nhóm quyền
     * @param groupId ID của nhóm quyền
     * @param permissionId ID của quyền
     * @return Thông tin nhóm quyền đã cập nhật
     */
    PermissionGroupResponse addPermissionToGroup(UUID groupId, UUID permissionId);
    
    /**
     * Xóa quyền khỏi nhóm quyền
     * @param groupId ID của nhóm quyền
     * @param permissionId ID của quyền
     * @return Thông tin nhóm quyền đã cập nhật
     */
    PermissionGroupResponse removePermissionFromGroup(UUID groupId, UUID permissionId);
    
    /**
     * Gán nhóm quyền cho người dùng
     * @param userId ID của người dùng
     * @param groupId ID của nhóm quyền
     */
    void assignPermissionGroupToUser(UUID userId, UUID groupId);
    
    /**
     * Gỡ bỏ nhóm quyền khỏi người dùng
     * @param userId ID của người dùng
     * @param groupId ID của nhóm quyền
     */
    void removePermissionGroupFromUser(UUID userId, UUID groupId);
    
    /**
     * Lấy danh sách ID của các nhóm quyền của một người dùng
     * @param userId ID của người dùng
     * @return Danh sách ID của các nhóm quyền
     */
    List<UUID> getUserPermissionGroups(UUID userId);
    
    /**
     * Lấy danh sách quyền của tất cả người dùng
     * @return Map với key là ID người dùng và value là danh sách ID của các nhóm quyền
     */
    Map<UUID, List<UUID>> getAllUserPermissionGroups();
    
    /**
     * Kiểm tra người dùng có quyền thực hiện một hành động không
     * @param username Tên đăng nhập của người dùng
     * @param permissionCode Mã quyền cần kiểm tra
     * @return true nếu người dùng có quyền, false nếu không có quyền
     */
    boolean hasPermission(String username, String permissionCode);
    
    /**
     * Lấy thông tin chi tiết về quyền của người dùng
     * @param username Tên đăng nhập của người dùng
     * @return Map chứa thông tin về quyền của người dùng
     */
    Map<String, Object> getUserPermissionInfo(String username);
} 