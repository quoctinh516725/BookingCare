package com.dailycodework.beautifulcare.service.impl;

import com.dailycodework.beautifulcare.dto.request.LoginRequest;
import com.dailycodework.beautifulcare.dto.request.RefreshTokenRequest;
import com.dailycodework.beautifulcare.dto.request.RegisterRequest;
import com.dailycodework.beautifulcare.dto.response.LoginResponse;
import com.dailycodework.beautifulcare.entity.RefreshToken;
import com.dailycodework.beautifulcare.entity.User;
import com.dailycodework.beautifulcare.entity.UserRole;
import com.dailycodework.beautifulcare.exception.ResourceNotFoundException;
import com.dailycodework.beautifulcare.repository.RefreshTokenRepository;
import com.dailycodework.beautifulcare.repository.UserRepository;
import com.dailycodework.beautifulcare.service.AuthService;
import com.dailycodework.beautifulcare.service.JwtService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Override
    public LoginResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        var user = User.builder()
                .email(request.getEmail())
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .role(request.getRole() != null ? UserRole.valueOf(request.getRole().toUpperCase()) : UserRole.CUSTOMER)
                .build();

        User savedUser = userRepository.save(user);
        var jwtToken = jwtService.generateToken(savedUser);
        var refreshToken = jwtService.generateRefreshToken(savedUser);

        saveUserRefreshToken(savedUser, refreshToken);

        return buildLoginResponse(savedUser, jwtToken, refreshToken);
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        try {
            // Xác thực thông tin đăng nhập
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()));

            // Tìm thông tin người dùng bằng username hoặc email
            var user = userRepository.findByUsernameOrEmail(request.getUsername(), request.getUsername())
                    .orElseThrow(
                            () -> new UsernameNotFoundException("User not found with username or email: " + request.getUsername()));

            // Tạo token và refresh token
            var jwtToken = jwtService.generateToken(user);
            var refreshToken = jwtService.generateRefreshToken(user);

            // Lưu thông tin refresh token
            saveUserRefreshToken(user, refreshToken);

            // Trả về token
            return buildLoginResponse(user, jwtToken, refreshToken);
        } catch (BadCredentialsException e) {
            throw new RuntimeException("Invalid credentials");
        } catch (DisabledException e) {
            throw new RuntimeException("Account is disabled");
        } catch (UsernameNotFoundException e) {
            throw new RuntimeException("User not found");
        } catch (Exception e) {
            throw new RuntimeException("Authentication failed: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public LoginResponse refreshToken(RefreshTokenRequest request) {
        String token = request.getRefreshToken();

        // Tìm refresh token trong database
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Refresh token not found"));

        // Kiểm tra token còn hạn sử dụng và hợp lệ
        if (refreshToken.isExpired() || !refreshToken.isValid()) {
            refreshToken.setValid(false);
            refreshTokenRepository.save(refreshToken);
            throw new RuntimeException("Refresh token is expired or invalidated");
        }

        User user = refreshToken.getUser();

        // Tạo token mới
        String newAccessToken = jwtService.generateToken(user);

        // Tạo refresh token mới (có thể tái sử dụng refresh token cũ)
        // Đây là một lựa chọn thiết kế: bạn có thể tạo refresh token mới hoặc tiếp tục
        // sử dụng cũ

        return buildLoginResponse(user, newAccessToken, token);
    }

    @Override
    @Transactional
    public void logout() {
        // Lấy thông tin người dùng hiện tại
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String username = authentication.getName();
            // Vô hiệu hóa refresh token nếu có lưu trong database
            invalidateUserRefreshTokens(username);
        }

        // Xóa thông tin xác thực khỏi SecurityContext
        SecurityContextHolder.clearContext();
    }
    
    @Override
    @Transactional
    public void forceRefreshToken(UUID userId) {
        log.info("Forcing token refresh for user ID: {}", userId);
        
        // Tìm user trong cơ sở dữ liệu
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));
            
        // Lấy email để vô hiệu hóa tất cả token hiện tại
        String email = user.getEmail();
        
        // Vô hiệu hóa tất cả refresh token hiện tại của user
        log.info("Invalidating all tokens for user with email: {}", email);
        invalidateUserRefreshTokens(email); // Chỉ gọi phương thức, không cần lấy kết quả trả về
        
        log.info("Successfully invalidated tokens for user ID: {}", userId);
        
        // Cập nhật timestamp cho field permissionsUpdatedAt nếu có
        // Đây là một cách để đánh dấu token hiện tại là hết hạn
        try {
            if (user.getClass().getDeclaredField("permissionsUpdatedAt") != null) {
                user.getClass().getMethod("updatePermissionsTimestamp").invoke(user);
                userRepository.save(user);
                log.info("Updated permissions timestamp for user ID: {}", userId);
            }
        } catch (Exception e) {
            // Trường này có thể chưa được thêm vào entity, bỏ qua
            log.debug("permissionsUpdatedAt field not found in User entity, skipping update");
        }
    }

    private void saveUserRefreshToken(User user, String token) {
        // Tạo đối tượng RefreshToken
        RefreshToken refreshToken = RefreshToken.builder()
                .token(token)
                .user(user)
                .expiresAt(LocalDateTime.now().plusDays(7)) // 7 ngày, phù hợp với cấu hình trong application.yaml
                .isValid(true)
                .build();

        // Lưu vào database
        refreshTokenRepository.save(refreshToken);
    }

    @Transactional
    public void invalidateUserRefreshTokens(String email) {
        refreshTokenRepository.invalidateAllUserTokens(email);
    }

    private LoginResponse buildLoginResponse(User user, String accessToken, String refreshToken) {
        return LoginResponse.builder()
                .token(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtService.getJwtExpiration() / 1000) // Chuyển đổi từ ms sang giây
                .userId(user.getId().toString())
                .userRole(user.getRole().name())
                .username(user.getUsername())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .build();
    }
}