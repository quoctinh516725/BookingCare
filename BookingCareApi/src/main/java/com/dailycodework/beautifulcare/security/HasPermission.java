package com.dailycodework.beautifulcare.security;

import org.springframework.security.access.prepost.PreAuthorize;

import java.lang.annotation.*;

/**
 * Annotation để kiểm tra quyền trên phương thức.
 * Ví dụ: @HasPermission("user:view") sẽ yêu cầu người dùng có quyền "user:view"
 * hoặc là ADMIN.
 */
@Target({ ElementType.METHOD, ElementType.TYPE })
@Retention(RetentionPolicy.RUNTIME)
@Inherited
@Documented
@PreAuthorize("hasRole('ADMIN') or hasAuthority(#root.annotation.value())")
public @interface HasPermission {
    /**
     * Mã quyền cần kiểm tra
     */
    String value();
} 