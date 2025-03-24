package com.dailycodework.beautifulcare.dto.request;

import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentUpdateRequest {

    @Positive(message = "Amount must be greater than zero")
    private Double amount;

    private String paymentMethod;

    private String transactionId;

    private Boolean paid;

    private LocalDateTime paymentDate;
}