package com.dailycodework.beautifulcare.service.impl;

import com.dailycodework.beautifulcare.entity.User;
import com.dailycodework.beautifulcare.service.JwtService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
@Slf4j
public class JwtServiceImpl implements JwtService {

    @Value("${application.security.jwt.secret-key}")
    private String secretKey;
    @Value("${application.security.jwt.expiration}")
    private long jwtExpiration;
    @Value("${application.security.jwt.refresh-token.expiration}")
    private long refreshExpiration;

    @Override
    public String extractUsername(String token) {
        try {
            // Lấy cả username và email từ JWT claims
            Claims claims = extractAllClaims(token);
            String subject = claims.getSubject(); // Giá trị subject
            
            // Log chi tiết thông tin token để debugging
            log.debug("Extracted JWT claims - subject: {}, username: {}, email: {}", 
                    subject, claims.get("username"), claims.get("email"));
            
            // Nếu subject null nhưng claims username có giá trị, sử dụng username
            if (subject == null && claims.get("username") != null) {
                log.warn("JWT token has null subject but contains username claim, using username claim");
                return claims.get("username", String.class);
            }
            
            // Nếu subject null nhưng claims email có giá trị, sử dụng email
            if (subject == null && claims.get("email") != null) {
                log.warn("JWT token has null subject but contains email claim, using email claim");
                return claims.get("email", String.class);
            }
            
            return subject;
        } catch (Exception e) {
            log.error("Error extracting username from JWT token: {}", e.getMessage());
            return null;
        }
    }

    @Override
    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    @Override
    public String generateRefreshToken(UserDetails userDetails) {
        return generateRefreshToken(new HashMap<>(), userDetails);
    }

    @Override
    public long getJwtExpiration() {
        return jwtExpiration;
    }

    @Override
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String usernameFromToken = extractUsername(token);
        final User user = (User) userDetails;
        
        // Log để debug quá trình xác thực token
        log.debug("Validating token - Username from token: {}, User details: username={}, email={}", 
                usernameFromToken, user.getUsername(), user.getEmail());
                
        // Kiểm tra nếu username hoặc email từ token khớp với username hoặc email của user
        return (usernameFromToken.equals(user.getUsername()) || usernameFromToken.equals(user.getEmail())) 
               && !isTokenExpired(token);
    }

    @Override
    public boolean isRefreshTokenValid(String token, UserDetails userDetails) {
        final String usernameFromToken = extractUsername(token);
        final User user = (User) userDetails;
        
        // Kiểm tra nếu username hoặc email từ token khớp với username hoặc email của user
        return (usernameFromToken.equals(user.getUsername()) || usernameFromToken.equals(user.getEmail())) 
               && !isTokenExpired(token);
    }

    private String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        User user = (User) userDetails;

        // Thêm thông tin hữu ích vào token
        Map<String, Object> claims = new HashMap<>(extraClaims);
        claims.put("role", user.getRole().name());
        claims.put("userId", user.getId().toString());
        claims.put("firstName", user.getFirstName());
        claims.put("lastName", user.getLastName());
        claims.put("email", user.getEmail());
        claims.put("username", user.getUsername()); // Thêm username vào claims

        // Log để debug quá trình tạo token
        log.debug("Generating JWT token for user: {} ({})", user.getUsername(), user.getEmail());

        return Jwts
                .builder()
                .claims(claims)
                .subject(user.getUsername()) // Sử dụng username làm subject
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSignInKey())
                .compact();
    }

    private String generateRefreshToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        User user = (User) userDetails;
        
        // Thêm cả username và email vào refresh token để dễ dàng xác thực sau này
        Map<String, Object> claims = new HashMap<>(extraClaims);
        claims.put("email", user.getEmail());
        claims.put("username", user.getUsername());
        
        return Jwts
                .builder()
                .claims(claims)
                .subject(user.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + refreshExpiration))
                .signWith(getSignInKey())
                .compact();
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        try {
            return Jwts
                    .parser()
                    .setSigningKey(getSignInKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception e) {
            log.error("Error parsing JWT token: {}", e.getMessage());
            throw e;
        }
    }

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}