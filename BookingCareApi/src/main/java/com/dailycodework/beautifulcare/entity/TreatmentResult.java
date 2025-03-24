package com.dailycodework.beautifulcare.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity representing a treatment result.
 */
@Data
@Entity
@Table(name = "treatment_result")
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TreatmentResult {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @OneToOne
    @JoinColumn(name = "treatment_id")
    private Treatment treatment;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String recommendations;

    @ElementCollection
    @CollectionTable(name = "treatment_result_images", joinColumns = @JoinColumn(name = "result_id"), foreignKey = @ForeignKey(name = "FK_TREATMENT_RESULT_IMAGES"))
    @Column(name = "image_url")
    @Builder.Default
    private List<String> imageUrls = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "treatment_product_recommendations", joinColumns = @JoinColumn(name = "result_id"), foreignKey = @ForeignKey(name = "FK_TREATMENT_PRODUCT_RECOMMENDATIONS"))
    @Column(name = "product_recommendation")
    @Builder.Default
    private List<String> productRecommendations = new ArrayList<>();

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}