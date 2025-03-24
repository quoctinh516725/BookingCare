package com.dailycodework.beautifulcare.dto.response;

import com.dailycodework.beautifulcare.entity.UserRole;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthenticationResponse {
    private String token;
    private String userId;
    private String username;
    private UserRole role;
}
