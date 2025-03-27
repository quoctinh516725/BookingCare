package com.dailycodework.beautifulcare.service;

import com.dailycodework.beautifulcare.dto.request.LoginRequest;
import com.dailycodework.beautifulcare.dto.request.RefreshTokenRequest;
import com.dailycodework.beautifulcare.dto.request.RegisterRequest;
import com.dailycodework.beautifulcare.dto.response.LoginResponse;

public interface AuthService {
    LoginResponse register(RegisterRequest request);

    LoginResponse login(LoginRequest request);

    LoginResponse refreshToken(RefreshTokenRequest request);

    void logout();
}