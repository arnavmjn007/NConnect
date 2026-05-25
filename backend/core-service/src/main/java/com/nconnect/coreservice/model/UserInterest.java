package com.nconnect.coreservice.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "user_interests")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserInterest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @Column(name = "interest_name", nullable = false)
    private String interestName;
}