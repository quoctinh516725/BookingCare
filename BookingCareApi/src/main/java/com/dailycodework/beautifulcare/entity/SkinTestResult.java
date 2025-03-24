package com.dailycodework.beautifulcare.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Entity
@Data
@Table(name = "skin_test_results")
@EntityListeners(AuditingEntityListener.class)
public class SkinTestResult {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne
    @JoinColumn(name = "skin_test_id")
    private SkinTest skinTest;

    @Enumerated(EnumType.STRING)
    private SkinType resultSkinType;

    @ElementCollection
    @CollectionTable(name = "skin_test_answers", joinColumns = @JoinColumn(name = "result_id"))
    @MapKeyColumn(name = "question_id")
    @Column(name = "option_id")
    private Map<String, String> answers = new HashMap<>();

    private String recommendation;

    @CreatedDate
    private LocalDateTime createdAt;
}