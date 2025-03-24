package com.dailycodework.beautifulcare.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "feedbacks")
@EntityListeners(AuditingEntityListener.class)
public class Feedback {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String subject;
    private String message;
    private boolean read = false;
    private String reply;

    @ManyToOne
    @JoinColumn(name = "replied_by")
    private User repliedBy;

    private LocalDateTime repliedAt;

    @CreatedDate
    private LocalDateTime createdAt;
}