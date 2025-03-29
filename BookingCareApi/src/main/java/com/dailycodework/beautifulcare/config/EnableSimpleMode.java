package com.dailycodework.beautifulcare.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

import com.dailycodework.beautifulcare.exception.SimpleExceptionHandler;
import com.dailycodework.beautifulcare.security.SimpleSecurityUtils;
import com.dailycodework.beautifulcare.service.impl.SimpleUserDetailsServiceImpl;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation để kích hoạt "Simple Mode" - chế độ đơn giản hóa
 * Trong chế độ này:
 * - Không yêu cầu xác thực cho bất kỳ API nào
 * - Xử lý exception đơn giản
 * - Không kiểm tra quyền hoặc xác thực JWT
 * - Sử dụng SimpleUserDetailsServiceImpl để luôn trả về đối tượng User (không bao giờ null)
 * - Sử dụng SimpleSecurityUtils để luôn trả về kết quả thành công khi kiểm tra quyền
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Configuration
@Import({
    SimpleSecurityConfig.class, 
    SimpleExceptionHandler.class, 
    SimpleUserDetailsServiceImpl.class,
    SimpleSecurityUtils.class
})
public @interface EnableSimpleMode {
} 