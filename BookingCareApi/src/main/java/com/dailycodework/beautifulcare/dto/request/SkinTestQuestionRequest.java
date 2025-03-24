package com.dailycodework.beautifulcare.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkinTestQuestionRequest {

    @NotBlank(message = "Question text is required")
    private String question;

    @Min(value = 0, message = "Order index must be a positive number")
    private int orderIndex;

    @NotEmpty(message = "At least one option is required")
    @Valid
    private List<SkinTestOptionRequest> options;
}