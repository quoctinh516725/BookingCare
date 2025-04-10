package com.dailycodework.beautifulcare.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

/**
 * Đại diện cho một nhóm quyền trong hệ thống.
 * Mỗi nhóm quyền có thể chứa nhiều quyền (Permission) 
 * và có thể được gán cho nhiều người dùng (User).
 */
@Entity
@Table(name = "permission_groups")
@Data
@EqualsAndHashCode(exclude = {"permissions", "users"})  
@ToString(exclude = {"permissions", "users"})
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermissionGroup {
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(name = "id", columnDefinition = "BINARY(16)")
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name;
    
    @Column(nullable = false)
    private String description;
    
    // Many-to-many relationship with Permission
    @ManyToMany(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "permission_group_permissions",
        joinColumns = @JoinColumn(name = "group_id"),
        inverseJoinColumns = @JoinColumn(name = "permission_id")
    )
    @Builder.Default
    private Set<Permission> permissions = new HashSet<>();
    
    // Many-to-many relationship with User
    @ManyToMany(mappedBy = "permissionGroups")
    @Builder.Default
    private Set<User> users = new HashSet<>();
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    /**
     * Lấy danh sách người dùng thuộc nhóm quyền này
     * @return Danh sách người dùng
     */
    public Set<User> getUsers() {
        if (users == null) {
            users = new HashSet<>();
        }
        return users;
    }
    
    /**
     * Thêm người dùng vào nhóm quyền
     * @param user Người dùng cần thêm
     */
    public void addUser(User user) {
        if (user == null) {
            return;
        }
        
        if (users == null) {
            users = new HashSet<>();
        }
        
        users.add(user);
        user.getPermissionGroups().add(this);
    }
    
    /**
     * Xóa người dùng khỏi nhóm quyền
     * @param user Người dùng cần xóa
     */
    public void removeUser(User user) {
        if (user == null || users == null) {
            return;
        }
        
        users.remove(user);
        user.getPermissionGroups().remove(this);
    }
    
    /**
     * Helper method to add a permission to this group
     */
    public void addPermission(Permission permission) {
        permissions.add(permission);
        permission.getGroups().add(this);
    }
    
    /**
     * Helper method to remove a permission from this group
     */
    public void removePermission(Permission permission) {
        permissions.remove(permission);
        permission.getGroups().remove(this);
    }
} 