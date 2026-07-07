package com.nconnect.coreservice.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.UUID;

@Entity
@Table(name = "platform_settings")
@Data
public class PlatformSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(columnDefinition = "TEXT")
    private String categories; // comma-separated

    @Column(columnDefinition = "TEXT")
    private String causes; // comma-separated
}