package com.nconnect.coreservice.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "announcements")
@Data
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private String audience;

    @Column(name = "created_by", nullable = false)
    private String createdBy;

    @Column(name = "scheduled_at")
    private Instant scheduledAt;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();
}