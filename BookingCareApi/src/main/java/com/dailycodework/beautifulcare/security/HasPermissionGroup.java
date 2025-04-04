package com.dailycodework.beautifulcare.security;

import org.springframework.security.access.prepost.PreAuthorize;

import java.lang.annotation.*;

/**
 * Annotation để kiểm tra nhóm quyền trên phương thức.
 * Phương thức sẽ yêu cầu người dùng thuộc nhóm quyền chỉ định hoặc là ADMIN.
 */
@Target({ ElementType.METHOD, ElementType.TYPE })
@Retention(RetentionPolicy.RUNTIME)
@Inherited
@Documented
@PreAuthorize("@securityUtils.hasPermissionGroup(#root.annotation.value()) or hasRole('ADMIN')")
public @interface HasPermissionGroup {
    /**
     * Tên nhóm quyền cần kiểm tra
     */
    String value();
} 