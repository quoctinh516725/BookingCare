package com.dailycodework.beautifulcare.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity đại diện cho thông tin thanh toán của một booking.
 */
@Entity
@Table(name = "payments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = {"booking", "processedBy"})
@ToString(exclude = {"booking", "processedBy"})
public class Payment {
    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "uuid2")
    @Column(name = "id", columnDefinition = "BINARY(16)")
    private UUID id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", columnDefinition = "BINARY(16)", nullable = false)
    private Booking booking;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private PaymentStatus status = PaymentStatus.UNPAID;
    
    @Column(unique = true, nullable = false)
    private String paymentCode;
    
    @Column(columnDefinition = "TEXT")
    private String qrCodeData;
    
    @Column(nullable = false)
    private BigDecimal amount;
    
    @Column
    private String paymentMethod;
    
    @Column
    private String transactionId;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column
    private LocalDateTime paidAt;
    
    @Column
    private LocalDateTime refundedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by", columnDefinition = "BINARY(16)")
    private User processedBy;
} 