package com.dailycodework.beautifulcare.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "ratings")
@EntityListeners(AuditingEntityListener.class)
public class Rating {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne
    @JoinColumn(name = "booking_id")
    private Booking booking;

    @ManyToOne
    @JoinColumn(name = "specialist_id")
    private Specialist specialist;

    private int serviceRating; // 1-5 stars
    private int specialistRating; // 1-5 stars
    private int overallRating; // 1-5 stars

    private String comment;

    @CreatedDate
    private LocalDateTime createdAt;
}