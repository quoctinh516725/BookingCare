package com.dailycodework.beautifulcare.dto.response;

import com.dailycodework.beautifulcare.entity.BookingStatus;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Set;
import java.util.UUID;

@Data
@SuperBuilder
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class UpdateBookingResponse extends BookingResponse {
    private UUID updatedBy;
    private LocalDateTime updatedAt;
    private String updateNotes;
} 