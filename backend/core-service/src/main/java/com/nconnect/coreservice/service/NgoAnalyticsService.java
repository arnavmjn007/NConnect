package com.nconnect.coreservice.service;

import com.nconnect.coreservice.dto.ai.*;
import com.nconnect.coreservice.model.AppUser;
import com.nconnect.coreservice.model.Project;
import com.nconnect.coreservice.model.VolunteerApplication;
import com.nconnect.coreservice.model.enums.ProjectStatus;
import com.nconnect.coreservice.repository.PaymentRecordRepository;
import com.nconnect.coreservice.repository.ProjectRepository;
import com.nconnect.coreservice.repository.VolunteerApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NgoAnalyticsService {

    private final ProjectRepository projectRepository;
    private final VolunteerApplicationRepository volunteerApplicationRepository;
    private final PaymentRecordRepository paymentRecordRepository;
    private final AiClientService aiClientService;

    private static final String DONATION_PREFIX = "project_donation:";
    private static final DateTimeFormatter MONTH_FMT = DateTimeFormatter.ofPattern("yyyy-MM");

    @Transactional(readOnly = true)
    public Map<String, Object> buildProAnalytics(AppUser ngo) {
        List<Project> projects = projectRepository
                .findByNgoIdOrderByCreatedAtDesc(ngo.getId(), ProjectStatus.CANCELLED);
        List<UUID> projectIds = projects.stream().map(Project::getId).toList();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("donationTrend", buildDonationTrend(projectIds));
        result.put("volunteerActivityTrend", buildVolunteerActivityTrend(projectIds));
        result.put("volunteerPerformance", buildVolunteerPerformance(projectIds));
        result.put("projectSuccessScores", buildProjectSuccessScores(projects));
        return result;
    }

    private List<Map<String, Object>> buildDonationTrend(List<UUID> projectIds) {
        if (projectIds.isEmpty()) return emptySixMonths("amount");

        Set<String> relevantPurposes = projectIds.stream()
                .map(id -> DONATION_PREFIX + id)
                .collect(Collectors.toSet());

        Map<String, Long> byMonth = new TreeMap<>();
        paymentRecordRepository.findAll().stream()
                .filter(p -> "COMPLETED".equals(p.getStatus()))
                .filter(p -> p.getPurpose() != null && relevantPurposes.contains(p.getPurpose()))
                .filter(p -> p.getCreatedAt() != null)
                .forEach(p -> {
                    String month = YearMonth.from(p.getCreatedAt()).format(MONTH_FMT);
                    byMonth.merge(month, (long) p.getAmount(), Long::sum);
                });

        return lastSixMonths(byMonth, "amount");
    }

    private List<Map<String, Object>> buildVolunteerActivityTrend(List<UUID> projectIds) {
        if (projectIds.isEmpty()) return emptySixMonths("count");

        List<VolunteerApplication> applications = volunteerApplicationRepository.findByProjectIdIn(projectIds);

        Map<String, Long> byMonth = new TreeMap<>();
        applications.stream()
                .filter(a -> "ACCEPTED".equals(a.getStatus()))
                .filter(a -> a.getCreatedAt() != null)
                .forEach(a -> {
                    String month = YearMonth.from(a.getCreatedAt()).format(MONTH_FMT);
                    byMonth.merge(month, 1L, Long::sum);
                });

        return lastSixMonths(byMonth, "count");
    }

    private List<Map<String, Object>> lastSixMonths(Map<String, Long> byMonth, String valueKey) {
        List<String> months = monthKeys();
        return months.stream()
                .map(m -> {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("month", m);
                    row.put(valueKey, byMonth.getOrDefault(m, 0L));
                    return row;
                })
                .toList();
    }

    private List<Map<String, Object>> emptySixMonths(String valueKey) {
        return lastSixMonths(new TreeMap<>(), valueKey);
    }

    private List<String> monthKeys() {
        List<String> months = new ArrayList<>();
        YearMonth cursor = YearMonth.now().minusMonths(5);
        for (int i = 0; i < 6; i++) {
            months.add(cursor.format(MONTH_FMT));
            cursor = cursor.plusMonths(1);
        }
        return months;
    }

    private List<VolunteerPerformanceScore> buildVolunteerPerformance(List<UUID> projectIds) {
        if (projectIds.isEmpty()) return List.of();

        List<VolunteerApplication> applications = volunteerApplicationRepository.findByProjectIdIn(projectIds);

        Map<UUID, String> namesByApplicant = new LinkedHashMap<>();
        Map<UUID, Long> acceptedCounts = new LinkedHashMap<>();
        Map<UUID, Long> totalCounts = new LinkedHashMap<>();

        for (VolunteerApplication app : applications) {
            UUID applicantId = app.getApplicant().getId();
            namesByApplicant.putIfAbsent(applicantId,
                    app.getApplicant().getFullName() != null
                            ? app.getApplicant().getFullName()
                            : app.getApplicant().getUsername());
            totalCounts.merge(applicantId, 1L, Long::sum);
            if ("ACCEPTED".equals(app.getStatus())) {
                acceptedCounts.merge(applicantId, 1L, Long::sum);
            }
        }

        List<VolunteerPerformanceCandidateDto> candidates = namesByApplicant.keySet().stream()
                .map(id -> VolunteerPerformanceCandidateDto.builder()
                        .userId(id.toString())
                        .name(namesByApplicant.get(id))
                        .acceptedCount(acceptedCounts.getOrDefault(id, 0L).intValue())
                        .totalApplications(totalCounts.getOrDefault(id, 0L).intValue())
                        .build())
                .toList();

        if (candidates.isEmpty()) return List.of();

        VolunteerPerformanceRequest request = VolunteerPerformanceRequest.builder()
                .volunteers(candidates)
                .build();

        List<VolunteerPerformanceScore> scores = aiClientService.scoreVolunteerPerformance(request);

        scores.forEach(s -> {
            try {
                UUID id = UUID.fromString(s.getUserId());
                s.setName(namesByApplicant.getOrDefault(id, "Unknown Volunteer"));
            } catch (IllegalArgumentException e) {
                s.setName("Unknown Volunteer");
            }
        });

        return scores.stream()
                .sorted(Comparator.comparingInt(VolunteerPerformanceScore::getScore).reversed())
                .toList();
    }

    private List<ProjectPerformanceScore> buildProjectSuccessScores(List<Project> projects) {
        if (projects.isEmpty()) return List.of();

        Map<UUID, String> titlesByProject = new LinkedHashMap<>();
        projects.forEach(p -> titlesByProject.put(p.getId(), p.getTitle()));

        List<ProjectPerformanceCandidateDto> candidates = projects.stream()
                .map(p -> ProjectPerformanceCandidateDto.builder()
                        .projectId(p.getId().toString())
                        .title(p.getTitle())
                        .volunteersJoined(p.getVolunteersJoined() != null ? p.getVolunteersJoined() : 0)
                        .volunteerSlots(p.getVolunteerSlots() != null ? p.getVolunteerSlots() : 0)
                        .raisedAmount(p.getRaisedAmount() != null ? p.getRaisedAmount() : 0L)
                        .goalAmount(p.getGoalAmount() != null ? p.getGoalAmount() : 0L)
                        .build())
                .toList();

        ProjectPerformanceRequest request = ProjectPerformanceRequest.builder()
                .projects(candidates)
                .build();

        List<ProjectPerformanceScore> scores = aiClientService.scoreProjectPerformance(request);

        scores.forEach(s -> {
            try {
                UUID id = UUID.fromString(s.getProjectId());
                s.setTitle(titlesByProject.getOrDefault(id, "Unknown Project"));
            } catch (IllegalArgumentException e) {
                s.setTitle("Unknown Project");
            }
        });

        return scores.stream()
                .sorted(Comparator.comparingInt(ProjectPerformanceScore::getScore).reversed())
                .toList();
    }
}