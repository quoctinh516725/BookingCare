package com.dailycodework.beautifulcare.dto.response;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IntrospectResponse {
    private boolean active;
    private String username;
}
