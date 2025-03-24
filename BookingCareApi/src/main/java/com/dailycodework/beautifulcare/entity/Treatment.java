package com.dailycodework.beautifulcare.entity;

import com.dailycodework.beautifulcare.entity.enums.TreatmentStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity representing a treatment process.
 */
@Data
@Entity
@Table(name = "treatment")
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Treatment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private Service service;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "specialist_id", nullable = false)
    private Specialist specialist;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TreatmentStatus status;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @CreatedDate
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (status == null) {
            status = TreatmentStatus.SCHEDULED;
        }
    }

    @ManyToMany
    @JoinTable(name = "treatment_services", joinColumns = @JoinColumn(name = "treatment_id"), inverseJoinColumns = @JoinColumn(name = "service_id"))
    @Builder.Default
    private List<Service> services = new ArrayList<>();

    @OneToOne(mappedBy = "treatment", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private TreatmentResult result;

    /**
     * Start the treatment.
     * 
     * @return This treatment object with updated status and start time
     */
    public Treatment start() {
        this.status = TreatmentStatus.IN_PROGRESS;
        this.startTime = LocalDateTime.now();
        return this;
    }

    /**
     * Complete the treatment.
     * 
     * @return This treatment object with updated status and end time
     */
    public Treatment complete() {
        this.status = TreatmentStatus.COMPLETED;
        this.endTime = LocalDateTime.now();
        return this;
    }

    /**
     * Cancel the treatment.
     * 
     * @return This treatment object with updated status
     */
    public Treatment cancel() {
        this.status = TreatmentStatus.CANCELLED;
        return this;
    }

    public boolean hasResult() {
        return result != null;
    }

    public String getNote() {
        return this.notes;
    }

    public void setNote(String note) {
        this.notes = note;
    }

    public LocalDateTime getStartedAt() {
        return this.startTime;
    }

    public LocalDateTime getCompletedAt() {
        return this.endTime;
    }
}