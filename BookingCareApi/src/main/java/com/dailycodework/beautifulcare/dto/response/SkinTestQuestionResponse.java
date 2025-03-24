package com.dailycodework.beautifulcare.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class SkinTestQuestionResponse {
    private String id;
    private String question;
    private int orderIndex;
    private List<SkinTestOptionResponse> options;
}