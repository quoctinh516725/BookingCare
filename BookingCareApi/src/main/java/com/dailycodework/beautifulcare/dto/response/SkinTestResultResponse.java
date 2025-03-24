package com.dailycodework.beautifulcare.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
public class SkinTestResultResponse {
    private String id;
    private String skinTestId;
    private String customerId;
    private Map<String, String> answers;
    private LocalDateTime createdAt;
}