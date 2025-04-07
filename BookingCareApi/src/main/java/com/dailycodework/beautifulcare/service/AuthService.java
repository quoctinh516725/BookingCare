package com.dailycodework.beautifulcare.service;

import com.dailycodework.beautifulcare.dto.request.LoginRequest;
import com.dailycodework.beautifulcare.dto.request.RefreshTokenRequest;
import com.dailycodework.beautifulcare.dto.request.RegisterRequest;
import com.dailycodework.beautifulcare.dto.response.LoginResponse;

import java.util.UUID;

public interface AuthService {
    LoginResponse register(RegisterRequest request);

    LoginResponse login(LoginRequest request);

    LoginResponse refreshToken(RefreshTokenRequest request);

    void logout();
    
    /**
     * Force refresh token for a user after permission changes
     * @param userId ID of the user whose token needs to be refreshed
     * @return Updated login response with new token
     */
    void forceRefreshToken(UUID userId);
}