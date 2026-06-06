package com.nconnect.coreservice.dto;

import com.nconnect.coreservice.model.Project;
import com.nconnect.coreservice.model.enums.ProjectStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class ProjectResponse {

    private UUID id;
    private UUID ngoId;
    private String ngoName;
    private String ngoUsername;
    private boolean ngoVerified;

    private String title;
    private String description;
    private String category;
    private List<String> requiredSkills;
    private List<String> tags;
    private String location;
    private String duration;
    private String beneficiaryGroup;
    private Integer volunteerSlots;
    private Integer volunteersJoined;
    private String priorityLevel;
    private Long goalAmount;
    private Long raisedAmount;
    private Integer donorCount;
    private LocalDate startDate;
    private LocalDate endDate;
    private String imageUrl;
    private ProjectStatus status;
    private LocalDateTime createdAt;

    public static ProjectResponse from(Project p) {
        return ProjectResponse.builder()
                .id(p.getId())
                .ngoId(p.getNgo().getId())
                .ngoName(p.getNgo().getNgoProfile() != null
                        ? p.getNgo().getNgoProfile().getOrganizationName()
                        : p.getNgo().getFullName())
                .ngoUsername(p.getNgo().getUsername())
                .ngoVerified(p.getNgo().getNgoProfile() != null &&
                        p.getNgo().getNgoProfile().getVerificationStatus()
                                == com.nconnect.coreservice.model.enums.VerificationStatus.VERIFIED)
                .title(p.getTitle())
                .description(p.getDescription())
                .category(p.getCategory())
                .requiredSkills(splitCsv(p.getRequiredSkills()))
                .tags(splitCsv(p.getTags()))
                .location(p.getLocation())
                .duration(p.getDuration())
                .beneficiaryGroup(p.getBeneficiaryGroup())
                .volunteerSlots(p.getVolunteerSlots())
                .volunteersJoined(p.getVolunteersJoined())
                .priorityLevel(p.getPriorityLevel())
                .goalAmount(p.getGoalAmount())
                .raisedAmount(p.getRaisedAmount())
                .donorCount(p.getDonorCount())
                .startDate(p.getStartDate())
                .endDate(p.getEndDate())
                .imageUrl(p.getImageUrl())
                .status(p.getStatus())
                .createdAt(p.getCreatedAt())
                .build();
    }

    private static List<String> splitCsv(String value) {
        if (value == null || value.isBlank()) return List.of();
        return Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }
}