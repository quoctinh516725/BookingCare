package com.dailycodework.beautifulcare.config;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.source.ImmutableSecret;
import com.nimbusds.jose.proc.SecurityContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

/**
 * Cấu hình JWT Decoder cho việc xác thực token JWT
 */
@Configuration
public class JwtConfig {

    @Value("${jwt.signerKey}")
    private String jwtSignerKey;

    /**
     * Cấu hình JwtDecoder bean để giải mã và xác thực JWT tokens
     * 
     * @return JwtDecoder - bộ giải mã JWT
     */
    @Bean
    public JwtDecoder jwtDecoder() {
        // Tạo SecretKey từ chuỗi signerKey
        byte[] keyBytes = jwtSignerKey.getBytes(StandardCharsets.UTF_8);
        SecretKey secretKey = new SecretKeySpec(keyBytes, "HmacSHA512");

        // Tạo JwtDecoder với thuật toán HS512 để khớp với việc ký trong
        // AuthenticationService
        return NimbusJwtDecoder.withSecretKey(secretKey)
                .macAlgorithm(MacAlgorithm.HS512)
                .build();
    }
}