package com.nconnect.coreservice.model;

import com.nconnect.coreservice.model.enums.VerificationStatus;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "ngo_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NgoProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private AppUser user;

    @Column(name = "organization_name", nullable = false)
    private String organizationName;

    @Column(name = "mission_statement", columnDefinition = "TEXT")
    private String missionStatement;

    @Column(name = "ngo_categories")
    private String ngoCategories;

    @Column(name = "operating_locations")
    private String operatingLocations;

    // Filled during verification step, not onboarding
    @Column(name = "registration_number")
    private String registrationNumber;

    @Column(name = "website_url")
    private String websiteUrl;

    @Column(name = "founded_year")
    private Integer foundedYear;

    @Column(name = "document_url")
    private String documentUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false)
    @Builder.Default
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;
}