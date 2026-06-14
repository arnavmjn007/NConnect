package com.nconnect.coreservice.dto;

import com.nconnect.coreservice.model.AppUser;
import com.nconnect.coreservice.model.enums.Role;
import com.nconnect.coreservice.model.enums.VerificationStatus;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PublicProfileResponse {

    private String id;
    private String auth0Id;
    private String username;
    private String fullName;
    private String bio;
    private Role role;
    private String location;
    private String occupation;
    private String education;
    private String profileImageUrl;

    private List<String> skills;
    private List<String> interests;
    private List<String> causes;
    private List<String> languages;

    private String organizationName;
    private String missionStatement;
    private String ngoCategories;
    private String operatingLocations;
    private VerificationStatus verificationStatus;
    private boolean verified;

    private long followerCount;
    private long followingCount;

    public static PublicProfileResponse from(AppUser user) {
        UserProfileResponse base = UserProfileResponse.from(user);
        return PublicProfileResponse.builder()
                .id(base.getId().toString())
                .auth0Id(base.getAuth0Id())
                .username(base.getUsername())
                .fullName(base.getFullName())
                .bio(base.getBio())
                .role(base.getRole())
                .location(base.getLocation())
                .occupation(base.getOccupation())
                .education(base.getEducation())
                .profileImageUrl(base.getProfileImageUrl())
                .skills(base.getSkills())
                .interests(base.getInterests())
                .causes(base.getCauses())
                .languages(base.getLanguages())
                .organizationName(base.getOrganizationName())
                .missionStatement(base.getMissionStatement())
                .ngoCategories(base.getNgoCategories())
                .operatingLocations(base.getOperatingLocations())
                .verificationStatus(base.getVerificationStatus())
                .verified(base.isVerified())
                .followerCount(0)
                .followingCount(0)
                .build();
    }
}