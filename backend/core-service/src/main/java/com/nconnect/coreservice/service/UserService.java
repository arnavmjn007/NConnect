package com.nconnect.coreservice.service;

import com.nconnect.coreservice.dto.*;
import com.nconnect.coreservice.model.*;
import com.nconnect.coreservice.model.enums.Role;
import com.nconnect.coreservice.model.enums.VerificationStatus;
import com.nconnect.coreservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional
    public UserProfileResponse syncUser(Jwt jwt) {
        String auth0Id = jwt.getSubject();
        String name = jwt.getClaimAsString("name");
        String picture = jwt.getClaimAsString("picture");

        return userRepository.findByAuth0Id(auth0Id)
                .map(user -> {
                    // Always update fullName and profileImageUrl from Auth0 on every sync
                    boolean changed = false;
                    if (name != null && !name.equals(user.getFullName())) {
                        user.setFullName(name);
                        changed = true;
                    }
                    if (picture != null && !picture.equals(user.getProfileImageUrl())) {
                        user.setProfileImageUrl(picture);
                        changed = true;
                    }
                    if (changed) userRepository.save(user);
                    return UserProfileResponse.from(user);
                })
                .orElseGet(() -> {
                    String email = jwt.getClaimAsString("email");
                    if (email == null) {
                        email = jwt.getClaimAsString("https://uni-auth-project.jp.auth0.com/email");
                    }
                    if (email == null) {
                        email = auth0Id.replace("|", "_") + "@placeholder.nconnect.local";
                    }
                    final String finalEmail = email;
                    final String finalName = name;
                    final String finalPicture = picture;

                    try {
                        AppUser newUser = AppUser.builder()
                                .auth0Id(auth0Id)
                                .email(finalEmail)
                                .fullName(finalName)
                                .profileImageUrl(finalPicture)
                                .role(Role.USER)
                                .onboardingComplete(false)
                                .build();
                        return UserProfileResponse.from(userRepository.save(newUser));
                    } catch (Exception e) {
                        return userRepository.findByAuth0Id(auth0Id)
                                .map(UserProfileResponse::from)
                                .orElseThrow(() -> new RuntimeException("Failed to sync user"));
                    }
                });
    }

    @Transactional
    public UserProfileResponse completeUserOnboarding(Jwt jwt, UserOnboardingRequest req) {
        String auth0Id = jwt.getSubject();
        AppUser user = userRepository.findByAuth0Id(auth0Id)
                .orElseThrow(() -> new RuntimeException("User not found — call /sync first"));

        validateUsername(req.getUsername(), user.getUsername());

        user.setRole(Role.USER);
        user.setUsername(req.getUsername());
        user.setBio(req.getBio());
        user.setLocation(req.getLocation());
        user.setOccupation(req.getOccupation());
        user.setEducation(req.getEducation());
        user.setNgoProfile(null);

        replaceCollections(user, req.getSkills(), req.getInterests(), req.getLanguages(), req.getCauses());

        user.setOnboardingComplete(true);
        return UserProfileResponse.from(userRepository.save(user));
    }

    @Transactional
    public UserProfileResponse completeNgoOnboarding(Jwt jwt, NgoOnboardingRequest req) {
        String auth0Id = jwt.getSubject();
        AppUser user = userRepository.findByAuth0Id(auth0Id)
                .orElseThrow(() -> new RuntimeException("User not found — call /sync first"));

        validateUsername(req.getUsername(), user.getUsername());

        user.setRole(Role.NGO);
        user.setUsername(req.getUsername());
        user.setLocation(req.getLocation());
        user.setBio(null);
        user.setOccupation(null);
        user.setEducation(null);

        if (user.getNgoProfile() == null) {
            NgoProfile profile = NgoProfile.builder()
                    .user(user)
                    .organizationName(req.getOrganizationName())
                    .missionStatement(req.getMissionStatement())
                    .ngoCategories(req.getNgoCategories())
                    .operatingLocations(req.getOperatingLocations())
                    .verificationStatus(VerificationStatus.PENDING)
                    .build();
            user.setNgoProfile(profile);
        } else {
            NgoProfile profile = user.getNgoProfile();
            profile.setOrganizationName(req.getOrganizationName());
            profile.setMissionStatement(req.getMissionStatement());
            profile.setNgoCategories(req.getNgoCategories());
            profile.setOperatingLocations(req.getOperatingLocations());
        }

        replaceCollections(user, null, null, req.getLanguages(), req.getCauses());

        user.setOnboardingComplete(true);
        return UserProfileResponse.from(userRepository.save(user));
    }

    @Transactional
    public UserProfileResponse submitNgoVerification(Jwt jwt, NgoVerificationRequest req) {
        String auth0Id = jwt.getSubject();
        AppUser user = userRepository.findByAuth0Id(auth0Id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() != Role.NGO) {
            throw new RuntimeException("Only NGO accounts can submit verification");
        }

        NgoProfile profile = user.getNgoProfile();
        if (profile == null) {
            throw new RuntimeException("NGO profile not found — complete onboarding first");
        }

        profile.setRegistrationNumber(req.getRegistrationNumber());
        profile.setWebsiteUrl(req.getWebsiteUrl());
        profile.setFoundedYear(req.getFoundedYear());
        profile.setDocumentUrl(req.getDocumentUrl());
        profile.setVerificationStatus(VerificationStatus.UNDER_REVIEW);

        return UserProfileResponse.from(userRepository.save(user));
    }

    @Transactional
    public UserProfileResponse updateProfile(Jwt jwt, UpdateProfileRequest req) {
        String auth0Id = jwt.getSubject();
        AppUser user = userRepository.findByAuth0Id(auth0Id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (req.getUsername() != null) {
            validateUsername(req.getUsername(), user.getUsername());
            user.setUsername(req.getUsername());
        }
        if (req.getBio() != null) user.setBio(req.getBio());
        if (req.getLocation() != null) user.setLocation(req.getLocation());
        if (req.getOccupation() != null) user.setOccupation(req.getOccupation());
        if (req.getEducation() != null) user.setEducation(req.getEducation());

        if (req.getSkills() != null) {
            user.getSkills().clear();
            req.getSkills().forEach(s -> user.getSkills().add(
                    UserSkill.builder().user(user).skillName(s).build()));
        }
        if (req.getInterests() != null) {
            user.getInterests().clear();
            req.getInterests().forEach(i -> user.getInterests().add(
                    UserInterest.builder().user(user).interestName(i).build()));
        }
        if (req.getLanguages() != null) {
            user.getLanguages().clear();
            req.getLanguages().forEach(l -> user.getLanguages().add(
                    UserLanguage.builder().user(user).languageName(l).build()));
        }
        if (req.getCauses() != null) {
            user.getCauses().clear();
            req.getCauses().forEach(c -> user.getCauses().add(
                    UserCause.builder().user(user).causeName(c).build()));
        }

        return UserProfileResponse.from(userRepository.save(user));
    }

    @Transactional
    public void deleteAccount(Jwt jwt) {
        AppUser user = userRepository.findByAuth0Id(jwt.getSubject())
                .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user);
    }

    public UserProfileResponse getProfile(Jwt jwt) {
        AppUser user = userRepository.findByAuth0Id(jwt.getSubject())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return UserProfileResponse.from(user);
    }

    private void validateUsername(String requested, String current) {
        if (requested != null &&
                !requested.equals(current) &&
                userRepository.existsByUsername(requested)) {
            throw new RuntimeException("Username already taken");
        }
    }

    private void replaceCollections(AppUser user,
                                    java.util.List<String> skills,
                                    java.util.List<String> interests,
                                    java.util.List<String> languages,
                                    java.util.List<String> causes) {
        user.getSkills().clear();
        user.getInterests().clear();
        user.getLanguages().clear();
        user.getCauses().clear();

        if (skills != null) skills.forEach(s ->
                user.getSkills().add(UserSkill.builder().user(user).skillName(s).build()));
        if (interests != null) interests.forEach(i ->
                user.getInterests().add(UserInterest.builder().user(user).interestName(i).build()));
        if (languages != null) languages.forEach(l ->
                user.getLanguages().add(UserLanguage.builder().user(user).languageName(l).build()));
        if (causes != null) causes.forEach(c ->
                user.getCauses().add(UserCause.builder().user(user).causeName(c).build()));
    }
}