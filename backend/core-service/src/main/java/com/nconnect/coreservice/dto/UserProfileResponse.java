package com.nconnect.coreservice.dto;

import com.nconnect.coreservice.model.AppUser;
import com.nconnect.coreservice.model.enums.Role;
import lombok.Builder;
import lombok.Data;

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
    private String profileImageUrl;
    private boolean onboardingComplete;

    private List<String> skills;
    private List<String> interests;
    private List<String> languages;
    private List<String> causes;

    public static UserProfileResponse from(AppUser user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .auth0Id(user.getAuth0Id())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .username(user.getUsername())
                .bio(user.getBio())
                .role(user.getRole())
                .location(user.getLocation())
                .occupation(user.getOccupation())
                .profileImageUrl(user.getProfileImageUrl())
                .onboardingComplete(user.isOnboardingComplete())
                .skills(user.getSkills().stream()
                        .map(s -> s.getSkillName()).toList())
                .interests(user.getInterests().stream()
                        .map(i -> i.getInterestName()).toList())
                .languages(user.getLanguages().stream()
                        .map(l -> l.getLanguageName()).toList())
                .causes(user.getCauses().stream()
                        .map(c -> c.getCauseName()).toList())
                .build();
    }
}