package com.nconnect.coreservice.service;

import com.nconnect.coreservice.dto.ai.*;
import com.nconnect.coreservice.model.AppUser;
import com.nconnect.coreservice.model.PaymentRecord;
import com.nconnect.coreservice.model.Project;
import com.nconnect.coreservice.model.UserInterest;
import com.nconnect.coreservice.model.UserSkill;
import com.nconnect.coreservice.model.enums.ProjectStatus;
import com.nconnect.coreservice.model.enums.Role;
import com.nconnect.coreservice.repository.PaymentRecordRepository;
import com.nconnect.coreservice.repository.ProjectRepository;
import com.nconnect.coreservice.repository.UserRepository;
import com.nconnect.coreservice.repository.VolunteerApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final AiClientService aiClientService;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final VolunteerApplicationRepository volunteerApplicationRepository;
    private final PaymentRecordRepository paymentRecordRepository;

    private static final String DONATION_PREFIX = "project_donation:";

    @Transactional(readOnly = true)
    public List<MatchScore> recommendProjectsForCurrentUser(Jwt jwt) {
        AppUser user = userRepository.findByAuth0IdWithCollections(jwt.getSubject())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<ProjectCandidateDto> candidates = projectRepository.findAll().stream()
                .filter(p -> p.getStatus() == ProjectStatus.ACTIVE)
                .map(p -> ProjectCandidateDto.builder()
                        .projectId(p.getId().toString())
                        .title(p.getTitle())
                        .category(p.getCategory())
                        .requiredSkills(splitCsv(p.getRequiredSkills()))
                        .tags(splitCsv(p.getTags()))
                        .location(p.getLocation())
                        .build())
                .toList();

        ProjectRecommendationRequest request = ProjectRecommendationRequest.builder()
                .skills(user.getSkills().stream().map(UserSkill::getSkillName).toList())
                .interests(user.getInterests().stream().map(UserInterest::getInterestName).toList())
                .location(user.getLocation())
                .projects(candidates)
                .build();

        return aiClientService.recommendProjects(request);
    }

    @Transactional(readOnly = true)
    public List<VolunteerScore> recommendVolunteersForProject(Jwt jwt, UUID projectId) {
        AppUser ngo = userRepository.findByAuth0Id(jwt.getSubject())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!project.getNgo().getId().equals(ngo.getId())) {
            throw new RuntimeException("You do not own this project");
        }

        List<VolunteerCandidateDto> candidates = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.USER)
                .filter(u -> !volunteerApplicationRepository.existsByProjectIdAndApplicantId(projectId, u.getId()))
                .map(u -> VolunteerCandidateDto.builder()
                        .userId(u.getId().toString())
                        .skills(u.getSkills().stream().map(UserSkill::getSkillName).toList())
                        .interests(u.getInterests().stream().map(UserInterest::getInterestName).toList())
                        .location(u.getLocation())
                        .build())
                .toList();

        VolunteerRecommendationRequest request = VolunteerRecommendationRequest.builder()
                .projectId(project.getId().toString())
                .requiredSkills(splitCsv(project.getRequiredSkills()))
                .category(project.getCategory())
                .location(project.getLocation())
                .candidates(candidates)
                .build();

        return aiClientService.recommendVolunteers(request);
    }

    @Transactional(readOnly = true)
    public List<NgoScore> recommendNgosForCurrentUser(Jwt jwt) {
        AppUser user = userRepository.findByAuth0IdWithCollections(jwt.getSubject())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<PaymentRecord> donations = paymentRecordRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId());

        List<String> donatedCategories = donations.stream()
                .filter(r -> "COMPLETED".equals(r.getStatus()))
                .map(PaymentRecord::getPurpose)
                .filter(p -> p != null && p.startsWith(DONATION_PREFIX))
                .map(p -> p.substring(DONATION_PREFIX.length()))
                .map(this::safeParseUuid)
                .filter(id -> id != null)
                .map(projectRepository::findById)
                .filter(Optional::isPresent)
                .map(Optional::get)
                .map(Project::getCategory)
                .filter(c -> c != null && !c.isBlank())
                .distinct()
                .toList();

        List<String> volunteeredCategories = volunteerApplicationRepository
                .findByApplicantIdOrderByCreatedAtDesc(user.getId()).stream()
                .filter(a -> "ACCEPTED".equals(a.getStatus()))
                .map(a -> a.getProject().getCategory())
                .filter(c -> c != null && !c.isBlank())
                .distinct()
                .toList();

        List<NgoCandidateDto> ngoCandidates = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.NGO && u.getNgoProfile() != null)
                .map(u -> NgoCandidateDto.builder()
                        .ngoId(u.getId().toString())
                        .organizationName(u.getNgoProfile().getOrganizationName())
                        .categories(splitCsv(u.getNgoProfile().getNgoCategories()))
                        .location(u.getLocation())
                        .build())
                .toList();

        NgoRecommendationRequest request = NgoRecommendationRequest.builder()
                .interests(user.getInterests().stream().map(UserInterest::getInterestName).toList())
                .location(user.getLocation())
                .volunteeredCategories(volunteeredCategories)
                .donatedCategories(donatedCategories)
                .donationCount((int) donations.stream().filter(r -> "COMPLETED".equals(r.getStatus())).count())
                .ngos(ngoCandidates)
                .build();

        return aiClientService.recommendNgos(request);
    }

    public String summarizeText(String text) {
        return aiClientService.summarize(text);
    }

    private UUID safeParseUuid(String s) {
        try {
            return UUID.fromString(s);
        } catch (Exception e) {
            return null;
        }
    }

    private List<String> splitCsv(String value) {
        if (value == null || value.isBlank()) return List.of();
        return Arrays.stream(value.split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList();
    }
}