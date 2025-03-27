package com.dailycodework.beautifulcare.service;

import org.springframework.security.core.userdetails.UserDetails;

public interface JwtService {
    String extractUsername(String token);

    String generateToken(UserDetails userDetails);

    String generateRefreshToken(UserDetails userDetails);

    long getJwtExpiration();

    boolean isTokenValid(String token, UserDetails userDetails);

    boolean isRefreshTokenValid(String token, UserDetails userDetails);
}