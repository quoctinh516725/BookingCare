package com.dailycodework.beautifulcare.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@Table(name = "customers")
public class Customer extends User {
    private String address;

    @Enumerated(EnumType.STRING)
    private SkinType skinType;

    @OneToMany(mappedBy = "customer")
    private List<Booking> bookings = new ArrayList<>();

    @OneToMany(mappedBy = "customer")
    private List<SkinTestResult> skinTestResults = new ArrayList<>();

    @OneToMany(mappedBy = "customer")
    private List<Rating> ratings = new ArrayList<>();
}