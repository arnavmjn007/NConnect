package com.nconnect.coreservice.dto;

import com.nconnect.coreservice.model.AppUser;
import com.nconnect.coreservice.model.enums.Role;
import com.nconnect.coreservice.model.enums.VerificationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class UserProfileResponse {

    private UUID id;
    private String auth0Id;
    private String email;
    private String fullName;
    private String username;
    private String bio;
    private Role role;
    private String location;
    private String occupation;
    private String education;
    private String profileImageUrl;
    private boolean onboardingComplete;
    private LocalDateTime createdAt;

    private List<String> skills;
    private List<String> interests;
    private List<String> languages;
    private List<String> causes;

    private String organizationName;
    private String missionStatement;
    private String ngoCategories;
    private String operatingLocations;
    private VerificationStatus verificationStatus;
    private boolean verified;

    public static UserProfileResponse from(AppUser user) {
        UserProfileResponse.UserProfileResponseBuilder builder = UserProfileResponse.builder()
                .id(user.getId())
                .auth0Id(user.getAuth0Id())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .username(user.getUsername())
                .bio(user.getBio())
                .role(user.getRole())
                .location(user.getLocation())
                .occupation(user.getOccupation())
                .education(user.getEducation())
                .profileImageUrl(user.getProfileImageUrl())
                .onboardingComplete(user.isOnboardingComplete())
                .createdAt(user.getCreatedAt())
                .skills(user.getSkills().stream().map(s -> s.getSkillName()).toList())
                .interests(user.getInterests().stream().map(i -> i.getInterestName()).toList())
                .languages(user.getLanguages().stream().map(l -> l.getLanguageName()).toList())
                .causes(user.getCauses().stream().map(c -> c.getCauseName()).toList())
                .verified(false);

        if (user.getNgoProfile() != null) {
            var ngo = user.getNgoProfile();
            builder
                    .organizationName(ngo.getOrganizationName())
                    .missionStatement(ngo.getMissionStatement())
                    .ngoCategories(ngo.getNgoCategories())
                    .operatingLocations(ngo.getOperatingLocations())
                    .verificationStatus(ngo.getVerificationStatus())
                    .verified(ngo.getVerificationStatus() == VerificationStatus.VERIFIED);
        }

        return builder.build();
    }
}