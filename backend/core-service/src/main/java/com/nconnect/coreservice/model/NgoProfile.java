package com.nconnect.coreservice.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "ngo_profiles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
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

    @Column(name = "registration_number")
    private String registrationNumber;

    @Column(name = "founded_year")
    private Integer foundedYear;

    @Column(name = "website_url")
    private String websiteUrl;

    @Column(name = "organization_logo_url")
    private String organizationLogoUrl;

    @Column(name = "verification_status")
    @Builder.Default
    private String verificationStatus = "PENDING";

    @Column(name = "ngo_categories", columnDefinition = "TEXT")
    private String ngoCategories;

    @Column(name = "operating_locations", columnDefinition = "TEXT")
    private String operatingLocations;
}