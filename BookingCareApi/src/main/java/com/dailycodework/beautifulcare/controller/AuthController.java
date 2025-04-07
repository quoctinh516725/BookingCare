package com.dailycodework.beautifulcare.controller;

import com.dailycodework.beautifulcare.dto.request.LoginRequest;
import com.dailycodework.beautifulcare.dto.request.RefreshTokenRequest;
import com.dailycodework.beautifulcare.dto.request.RegisterRequest;
import com.dailycodework.beautifulcare.dto.response.LoginResponse;
import com.dailycodework.beautifulcare.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication management APIs")
@Slf4j
public class AuthController {

    private final AuthService authService;
    private static final int REFRESH_TOKEN_VALIDITY = 7 * 24 * 60 * 60; // 7 days in seconds

    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<LoginResponse> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletResponse response) {
        LoginResponse loginResponse = authService.register(request);
        setRefreshTokenCookie(response, loginResponse.getRefreshToken());
        // Don't send the refresh token in the response body
        loginResponse.setRefreshToken(null);
        return ResponseEntity.ok(loginResponse);
    }

    @PostMapping("/login")
    @Operation(summary = "Login with email and password")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {
        LoginResponse loginResponse = authService.login(request);
        setRefreshTokenCookie(response, loginResponse.getRefreshToken());
        // Don't send the refresh token in the response body
        loginResponse.setRefreshToken(null);
        return ResponseEntity.ok(loginResponse);
    }

    @PostMapping("/refresh-token")
    @Operation(summary = "Refresh access token using refresh token")
    public ResponseEntity<LoginResponse> refreshToken(
            HttpServletRequest request, 
            HttpServletResponse response,
            @RequestBody(required = false) RefreshTokenRequest bodyRequest) {
        
        // Extract refresh token from cookies
        String refreshToken = extractRefreshTokenFromCookies(request);
        log.info("Received refresh token request. Token from cookie: {}", refreshToken != null ? "present" : "absent");
        
        // If no token in cookies, try to get from request body
        if (refreshToken == null && bodyRequest != null && bodyRequest.getRefreshToken() != null) {
            log.info("Using refresh token from request body");
            refreshToken = bodyRequest.getRefreshToken();
        }
        
        // If still no token, return error
        if (refreshToken == null) {
            log.error("No refresh token provided in cookies or request body");
            throw new RuntimeException("Refresh token is required");
        }
        
        // Create the request with the token
        RefreshTokenRequest tokenRequest = RefreshTokenRequest.builder()
                .refreshToken(refreshToken)
                .build();
        
        // Process the token refresh
        LoginResponse loginResponse = authService.refreshToken(tokenRequest);
        log.info("Token refreshed successfully. New token generated.");
        
        // Set the new refresh token in cookies
        setRefreshTokenCookie(response, loginResponse.getRefreshToken());
        
        // Don't send the refresh token in the response body
        loginResponse.setRefreshToken(null);
        
        return ResponseEntity.ok(loginResponse);
    }
    
    @PostMapping("/force-refresh")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Force refresh token for a user after permission changes")
    public ResponseEntity<?> forceRefreshToken(@RequestParam UUID userId) {
        log.info("Forcing token refresh for user ID: {}", userId);
        authService.forceRefreshToken(userId);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "User tokens invalidated. Next login will generate new tokens with updated permissions."
        ));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        authService.logout();
        // Clear the refresh token cookie
        response.setHeader("Set-Cookie", "refresh_token=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax");
        return ResponseEntity.ok().build();
    }
    
    private void setRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        log.info("Setting refresh token cookie: {}", refreshToken.substring(0, Math.min(10, refreshToken.length())) + "...");
        
        // Thêm Same-Site policy
        response.setHeader("Set-Cookie", String.format("%s=%s; Max-Age=%d; Path=%s; HttpOnly; SameSite=Lax", 
            "refresh_token", refreshToken, REFRESH_TOKEN_VALIDITY, "/"));
        
        log.info("Cookie header set: {}", response.getHeader("Set-Cookie"));
    }
    
    private String extractRefreshTokenFromCookies(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            log.info("Found {} cookies", cookies.length);
            for (Cookie cookie : cookies) {
                log.info("Cookie: {} = {}", cookie.getName(), cookie.getValue().substring(0, Math.min(10, cookie.getValue().length())) + "...");
                if ("refresh_token".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        } else {
            log.warn("No cookies found in request");
        }
        return null;
    }
}