package com.dailycodework.beautifulcare.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@SuperBuilder
@NoArgsConstructor
@Entity
@Table(name = "specialist")
public class Specialist {
    @Id
    @GeneratedValue(generator = "custom-id")
    @GenericGenerator(name = "custom-id", strategy = "com.dailycodework.beautifulcare.config.CustomIdGenerator")
    private String id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String specialization;

    private String experience;

    private String education;

    private String certification;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private String imageUrl;

    @ManyToMany
    @JoinTable(name = "specialist_service", joinColumns = @JoinColumn(name = "specialist_id"), inverseJoinColumns = @JoinColumn(name = "service_id"))
    private List<Service> services = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public String getFirstName() {
        return user != null ? user.getFirstName() : null;
    }

    public String getLastName() {
        return user != null ? user.getLastName() : null;
    }
}