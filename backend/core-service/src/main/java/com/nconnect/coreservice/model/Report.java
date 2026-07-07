package com.nconnect.coreservice.model;

import com.nconnect.coreservice.model.enums.ReportStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "reports")
@Data
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    private AppUser reporter;

    @Column(nullable = false)
    private String targetType; // USER, PROJECT, RESOURCE, POST

    @Column(nullable = false)
    private String targetId;

    @Column(nullable = false)
    private String reason;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReportStatus status = ReportStatus.OPEN;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}