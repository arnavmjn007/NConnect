package com.nconnect.coreservice.service;

import com.nconnect.coreservice.dto.SearchResponse;
import com.nconnect.coreservice.model.AppUser;
import com.nconnect.coreservice.model.NgoProfile;
import com.nconnect.coreservice.model.Project;
import com.nconnect.coreservice.model.Resource;
import com.nconnect.coreservice.model.enums.Role;
import com.nconnect.coreservice.model.enums.VerificationStatus;
import com.nconnect.coreservice.repository.ProjectRepository;
import com.nconnect.coreservice.repository.ResourceRepository;
import com.nconnect.coreservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ResourceRepository resourceRepository;

    @Transactional(readOnly = true)
    public SearchResponse search(String query) {
        if (query == null || query.isBlank()) {
            return SearchResponse.builder()
                    .users(List.of()).ngos(List.of())
                    .projects(List.of()).resources(List.of())
                    .build();
        }
        String q = query.trim().toLowerCase();

        List<AppUser> allUsers = userRepository.findAll();

        List<SearchResponse.UserResult> users = allUsers.stream()
                .filter(u -> u.getRole() == Role.USER && u.isOnboardingComplete() && u.getDeletedAt() == null)
                .filter(u -> matches(q,
                        u.getFullName(), u.getUsername(), u.getBio(),
                        u.getOccupation(), u.getLocation()))
                .limit(8)
                .map(u -> SearchResponse.UserResult.builder()
                        .id(u.getId().toString())
                        .auth0Id(u.getAuth0Id())
                        .username(u.getUsername())
                        .fullName(u.getFullName())
                        .bio(u.getBio())
                        .occupation(u.getOccupation())
                        .location(u.getLocation())
                        .profileImageUrl(u.getProfileImageUrl())
                        .role(u.getRole().name())
                        .build())
                .toList();

        List<SearchResponse.NgoResult> ngos = allUsers.stream()
                .filter(u -> u.getRole() == Role.NGO && u.isOnboardingComplete()
                        && u.getDeletedAt() == null && u.getNgoProfile() != null)
                .filter(u -> {
                    NgoProfile ngo = u.getNgoProfile();
                    return matches(q,
                            ngo.getOrganizationName(), ngo.getMissionStatement(),
                            ngo.getNgoCategories(), ngo.getOperatingLocations(),
                            u.getLocation(), u.getUsername());
                })
                .sorted(Comparator.comparing((AppUser u) -> !isNgoPro(u)))
                .limit(8)
                .map(u -> {
                    NgoProfile ngo = u.getNgoProfile();
                    return SearchResponse.NgoResult.builder()
                            .id(ngo.getId().toString())
                            .userId(u.getId().toString())
                            .username(u.getUsername())
                            .organizationName(ngo.getOrganizationName())
                            .missionStatement(ngo.getMissionStatement())
                            .location(u.getLocation())
                            .ngoCategories(ngo.getNgoCategories())
                            .verificationStatus(ngo.getVerificationStatus().name())
                            .verified(ngo.getVerificationStatus() == VerificationStatus.VERIFIED)
                            .build();
                })
                .toList();

        List<SearchResponse.ProjectResult> projects = projectRepository.findAll().stream()
                .filter(p -> p.getStatus() != null)
                .filter(p -> matches(q,
                        p.getTitle(), p.getDescription(), p.getCategory(),
                        p.getLocation(), p.getRequiredSkills(), p.getTags()))
                .limit(8)
                .map(p -> SearchResponse.ProjectResult.builder()
                        .id(p.getId().toString())
                        .title(p.getTitle())
                        .description(p.getDescription())
                        .category(p.getCategory())
                        .location(p.getLocation())
                        .ngoName(p.getNgo() != null && p.getNgo().getNgoProfile() != null
                                ? p.getNgo().getNgoProfile().getOrganizationName()
                                : p.getNgo() != null ? p.getNgo().getFullName() : null)
                        .status(p.getStatus().name())
                        .priorityLevel(p.getPriorityLevel())
                        .goalAmount(p.getGoalAmount())
                        .raisedAmount(p.getRaisedAmount())
                        .build())
                .toList();

        List<SearchResponse.ResourceResult> resources = resourceRepository.findAll().stream()
                .filter(r -> matches(q,
                        r.getName(), r.getDescription(), r.getCategory(),
                        r.getLocation(), r.getTags()))
                .limit(8)
                .map(r -> SearchResponse.ResourceResult.builder()
                        .id(r.getId().toString())
                        .name(r.getName())
                        .description(r.getDescription())
                        .category(r.getCategory())
                        .location(r.getLocation())
                        .ownerName(r.getOwner() != null ? r.getOwner().getFullName() : null)
                        .status(r.getStatus().name())
                        .sharingType(r.getSharingType())
                        .condition(r.getCondition())
                        .build())
                .toList();

        return SearchResponse.builder()
                .users(users).ngos(ngos)
                .projects(projects).resources(resources)
                .build();
    }

    @Transactional(readOnly = true)
    public List<String> suggestions(String query) {
        if (query == null || query.isBlank()) return List.of();
        String q = query.trim().toLowerCase();

        List<String> ngoNames = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.NGO && u.getNgoProfile() != null)
                .filter(u -> u.getNgoProfile().getOrganizationName() != null
                        && u.getNgoProfile().getOrganizationName().toLowerCase().contains(q))
                .sorted(Comparator.comparing((AppUser u) -> !isNgoPro(u)))
                .map(u -> u.getNgoProfile().getOrganizationName())
                .limit(4)
                .toList();

        List<String> userNames = userRepository.findAll().stream()
                .filter(u -> u.getUsername() != null && u.getUsername().toLowerCase().contains(q))
                .map(AppUser::getUsername)
                .limit(3)
                .toList();

        List<String> projectTitles = projectRepository.findAll().stream()
                .filter(p -> p.getTitle() != null && p.getTitle().toLowerCase().contains(q))
                .map(Project::getTitle)
                .limit(3)
                .toList();

        return java.util.stream.Stream.of(ngoNames, userNames, projectTitles)
                .flatMap(List::stream)
                .distinct()
                .limit(8)
                .toList();
    }

    private boolean isNgoPro(AppUser u) {
        return u.getProExpiresAt() != null && u.getProExpiresAt().isAfter(LocalDateTime.now());
    }

    private boolean matches(String query, String... fields) {
        for (String field : fields) {
            if (field != null && field.toLowerCase().contains(query)) return true;
        }
        return false;
    }
}