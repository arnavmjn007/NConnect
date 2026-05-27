package com.nconnect.coreservice.service;

import com.nconnect.coreservice.dto.OnboardingRequest;
import com.nconnect.coreservice.dto.UserProfileResponse;
import com.nconnect.coreservice.model.*;
import com.nconnect.coreservice.model.enums.Role;
import com.nconnect.coreservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional
    public UserProfileResponse syncUser(Jwt jwt) {
        String auth0Id = jwt.getSubject();  // "auth0|abc123"
        String email = jwt.getClaimAsString("email");
        String name = jwt.getClaimAsString("name");
        String picture = jwt.getClaimAsString("picture");

        AppUser user = userRepository.findByAuth0Id(auth0Id)
                .orElseGet(() -> {
                    AppUser newUser = AppUser.builder()
                            .auth0Id(auth0Id)
                            .email(email)
                            .fullName(name)
                            .profileImageUrl(picture)
                            .role(Role.USER)
                            .onboardingComplete(false)
                            .build();
                    return userRepository.save(newUser);
                });

        return UserProfileResponse.from(user);
    }

    @Transactional
    public UserProfileResponse completeOnboarding(Jwt jwt, OnboardingRequest req) {
        String auth0Id = jwt.getSubject();
        AppUser user = userRepository.findByAuth0Id(auth0Id)
                .orElseThrow(() -> new RuntimeException("User not found — call /sync first"));

        if (req.getUsername() != null &&
                !req.getUsername().equals(user.getUsername()) &&
                userRepository.existsByUsername(req.getUsername())) {
            throw new RuntimeException("Username already taken");
        }

        if (req.getRole() != null) {
            try {
                user.setRole(Role.valueOf(req.getRole().toUpperCase()));
            } catch (IllegalArgumentException e) {
                user.setRole(Role.USER);
            }
        }

        user.setUsername(req.getUsername());
        user.setBio(req.getBio());
        user.setLocation(req.getLocation());

        if (user.getRole() == Role.NGO) {
            user.setOccupation(null);
            user.setEducation(null);

            if (user.getNgoProfile() == null) {
                NgoProfile profile = NgoProfile.builder()
                        .user(user)
                        .organizationName(req.getOccupation())
                        .build();
                user.setNgoProfile(profile);
            } else {
                user.getNgoProfile().setOrganizationName(req.getOccupation());
            }
        } else {
            user.setOccupation(req.getOccupation());
            user.setEducation(req.getEducation());
            user.setNgoProfile(null);
        }

        user.getSkills().clear();
        user.getInterests().clear();
        user.getLanguages().clear();
        user.getCauses().clear();

        if (req.getSkills() != null) {
            req.getSkills().forEach(skill ->
                    user.getSkills().add(
                            UserSkill.builder().user(user).skillName(skill).build()
                    )
            );
        }

        if (req.getInterests() != null) {
            req.getInterests().forEach(interest ->
                    user.getInterests().add(
                            UserInterest.builder().user(user).interestName(interest).build()
                    )
            );
        }

        if (req.getLanguages() != null) {
            req.getLanguages().forEach(lang ->
                    user.getLanguages().add(
                            UserLanguage.builder().user(user).languageName(lang).build()
                    )
            );
        }

        if (req.getCauses() != null) {
            req.getCauses().forEach(cause ->
                    user.getCauses().add(
                            UserCause.builder().user(user).causeName(cause).build()
                    )
            );
        }

        user.setOnboardingComplete(true);
        return UserProfileResponse.from(userRepository.save(user));
    }

    public UserProfileResponse getProfile(Jwt jwt) {
        AppUser user = userRepository.findByAuth0Id(jwt.getSubject())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return UserProfileResponse.from(user);
    }
}