package com.dailycodework.beautifulcare.service;

import com.dailycodework.beautifulcare.dto.request.AuthenticationRequest;
import com.dailycodework.beautifulcare.dto.request.IntrospectRequest;
import com.dailycodework.beautifulcare.dto.response.AuthenticationResponse;
import com.dailycodework.beautifulcare.dto.response.IntrospectResponse;
import com.dailycodework.beautifulcare.entity.User;
import com.dailycodework.beautifulcare.exception.AppException;
import com.dailycodework.beautifulcare.exception.ErrorCode;
import com.dailycodework.beautifulcare.repository.UserRepository;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @NonFinal
    @Value("${jwt.signerKey}")
    protected String SIGNER_KEY = "";

    @NonFinal
    @Value("${jwt.expiration:86400000}")
    protected long JWT_EXPIRATION = 86400000; // 24 giờ mặc định

    public IntrospectResponse introspect(IntrospectRequest request) throws ParseException, JOSEException {
        SignedJWT signedJWT = SignedJWT.parse(request.getToken());
        JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());

        boolean valid = signedJWT.verify(verifier);
        if (!valid) {
            throw new JOSEException("Invalid signature");
        }

        JWTClaimsSet claimsSet = signedJWT.getJWTClaimsSet();
        Date expirationTime = claimsSet.getExpirationTime();

        if (expirationTime != null && expirationTime.before(new Date())) {
            throw new JOSEException("Token expired");
        }

        return IntrospectResponse.builder()
                .active(true)
                .username(claimsSet.getSubject())
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        try {
            String token = createToken(user);
            return AuthenticationResponse.builder()
                    .token(token)
                    .userId(user.getId())
                    .username(user.getUsername())
                    .role(user.getRole())
                    .build();
        } catch (JOSEException e) {
            throw new RuntimeException(e);
        }
    }

    private String createToken(User user) throws JOSEException {
        JWSSigner signer = new MACSigner(SIGNER_KEY.getBytes());

        Instant now = Instant.now();
        Instant expiry = now.plusMillis(JWT_EXPIRATION);

        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .subject(user.getUsername())
                .issuer("beautiful-care")
                .issueTime(Date.from(now))
                .expirationTime(Date.from(expiry))
                .jwtID(UUID.randomUUID().toString())
                .claim("userId", user.getId())
                .claim("role", user.getRole().name())
                .build();

        SignedJWT signedJWT = new SignedJWT(new JWSHeader(JWSAlgorithm.HS512), claimsSet);
        signedJWT.sign(signer);

        return signedJWT.serialize();
    }
}
