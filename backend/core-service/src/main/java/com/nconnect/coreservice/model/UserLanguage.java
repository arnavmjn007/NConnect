package com.nconnect.coreservice.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "user_languages")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserLanguage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @Column(name = "language_name", nullable = false)
    private String languageName;
}