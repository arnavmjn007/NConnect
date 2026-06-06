package com.nconnect.coreservice.model;

import com.nconnect.coreservice.model.enums.ProjectStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "projects")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ngo_id", nullable = false)
    private AppUser ngo;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String category;

    @Column(name = "required_skills")
    private String requiredSkills;

    @Column
    private String tags;

    @Column
    private String location;

    @Column
    private String duration;

    @Column(name = "beneficiary_group")
    private String beneficiaryGroup;

    @Column(name = "volunteer_slots")
    private Integer volunteerSlots;

    @Column(name = "volunteers_joined")
    @Builder.Default
    private Integer volunteersJoined = 0;

    @Column(name = "priority_level")
    @Builder.Default
    private String priorityLevel = "NORMAL";

    @Column(name = "goal_amount")
    private Long goalAmount;

    @Column(name = "raised_amount")
    @Builder.Default
    private Long raisedAmount = 0L;

    @Column(name = "donor_count")
    @Builder.Default
    private Integer donorCount = 0;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "image_url")
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ProjectStatus status = ProjectStatus.ACTIVE;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}