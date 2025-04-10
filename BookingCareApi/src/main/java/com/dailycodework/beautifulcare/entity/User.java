package com.dailycodework.beautifulcare.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class User implements UserDetails {
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(name = "id", columnDefinition = "BINARY(16)")
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    private String phone;

    @Enumerated(EnumType.STRING)
    private UserRole role;

    // New many-to-many relationship with PermissionGroup
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_permission_groups",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "group_id")
    )
    @Builder.Default
    private Set<PermissionGroup> permissionGroups = new HashSet<>();
    
    // Thêm trường để theo dõi thời điểm quyền được cập nhật
    @Column(name = "permissions_updated_at")
    private LocalDateTime permissionsUpdatedAt;

    @Column(length = 1000)
    private String description;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Set<GrantedAuthority> authorities = new HashSet<>();
        
        // Add role-based authority
        authorities.add(new SimpleGrantedAuthority("ROLE_" + role.name()));
        
        // Add permission-based authorities from all permission groups
        if (permissionGroups != null) {
            for (PermissionGroup group : permissionGroups) {
                for (Permission permission : group.getPermissions()) {
                    authorities.add(new SimpleGrantedAuthority(permission.getCode()));
                }
            }
        }
        
        return authorities;
    }
    
    /**
     * Kiểm tra xem người dùng có quyền cụ thể không
     * @param permissionCode Mã quyền cần kiểm tra
     * @return true nếu người dùng có quyền, false nếu không
     */
    public boolean hasPermission(String permissionCode) {
        // Admin luôn có tất cả các quyền
        if (role == UserRole.ADMIN) {
            return true;
        }
        
        // Kiểm tra đầu vào
        if (permissionCode == null || permissionCode.trim().isEmpty()) {
            return false;
        }
        
        // Nếu không có nhóm quyền nào
        if (permissionGroups == null || permissionGroups.isEmpty()) {
            return false;
        }
        
        // Kiểm tra trong tất cả các nhóm quyền của người dùng
        for (PermissionGroup group : permissionGroups) {
            if (group == null || group.getPermissions() == null || group.getPermissions().isEmpty()) {
                continue;
            }
            
            for (Permission permission : group.getPermissions()) {
                if (permission != null && permissionCode.equals(permission.getCode())) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    /**
     * Kiểm tra xem người dùng có thuộc một nhóm quyền cụ thể không
     * @param groupName Tên nhóm quyền cần kiểm tra
     * @return true nếu người dùng thuộc nhóm quyền, false nếu không
     */
    public boolean hasPermissionGroup(String groupName) {
        // Admin luôn có tất cả các nhóm quyền
        if (role == UserRole.ADMIN) {
            return true;
        }
        
        return permissionGroups.stream()
            .anyMatch(group -> group.getName().equals(groupName));
    }

    @Override
    public String getUsername() {
        return username;
    }

    public String getUsernameValue() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
    
    /**
     * Helper method to add a permission group to this user
     */
    public void addPermissionGroup(PermissionGroup group) {
        permissionGroups.add(group);
        group.getUsers().add(this);
        updatePermissionsTimestamp();
    }
    
    /**
     * Helper method to remove a permission group from this user
     */
    public void removePermissionGroup(PermissionGroup group) {
        permissionGroups.remove(group);
        group.getUsers().remove(this);
        updatePermissionsTimestamp();
    }
    
    /**
     * Cập nhật timestamp khi quyền của người dùng thay đổi
     */
    public void updatePermissionsTimestamp() {
        this.permissionsUpdatedAt = LocalDateTime.now();
    }
}
