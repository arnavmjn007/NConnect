package com.nconnect.coreservice.controller;

import com.nconnect.coreservice.dto.ProjectResponse;
import com.nconnect.coreservice.dto.ResourceResponse;
import com.nconnect.coreservice.model.*;
import com.nconnect.coreservice.model.enums.ReportStatus;
import com.nconnect.coreservice.model.enums.Role;
import com.nconnect.coreservice.model.enums.VerificationStatus;
import com.nconnect.coreservice.repository.*;
import com.nconnect.coreservice.service.NotificationWebhookService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;
    private final ResourceRepository resourceRepository;
    private final PaymentRecordRepository paymentRecordRepository;
    private final ReportRepository reportRepository;
    private final AnnouncementRepository announcementRepository;
    private final AuditLogRepository auditLogRepository;
    private final PlatformSettingsRepository platformSettingsRepository;
    private final NotificationWebhookService notificationWebhookService;

    private AppUser requireAdmin(Jwt jwt) {
        AppUser user = userRepository.findByAuth0Id(jwt.getSubject())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getRole() != Role.ADMIN) {
            throw new RuntimeException("Admin access required");
        }
        return user;
    }

    private void logAction(AppUser admin, String action, String targetType, String targetId, String details) {
        AuditLog log = new AuditLog();
        log.setAdminEmail(admin.getEmail());
        log.setAction(action);
        log.setTargetType(targetType);
        log.setTargetId(targetId);
        log.setDetails(details);
        auditLogRepository.save(log);
    }

    @GetMapping("/ngo-verifications")
    public ResponseEntity<List<Map<String, Object>>> getNgoVerifications(
            @AuthenticationPrincipal Jwt jwt) {
        requireAdmin(jwt);
        List<AppUser> ngos = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.NGO && u.getNgoProfile() != null)
                .toList();

        List<Map<String, Object>> result = ngos.stream().map(u -> {
            var ngo = u.getNgoProfile();
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId().toString());
            map.put("organizationName", ngo.getOrganizationName() != null ? ngo.getOrganizationName() : "");
            map.put("username", u.getUsername() != null ? u.getUsername() : "");
            map.put("email", u.getEmail());
            map.put("registrationNumber", ngo.getRegistrationNumber() != null ? ngo.getRegistrationNumber() : "");
            map.put("websiteUrl", ngo.getWebsiteUrl() != null ? ngo.getWebsiteUrl() : "");
            map.put("documentUrl", ngo.getDocumentUrl() != null ? ngo.getDocumentUrl() : "");
            map.put("verificationStatus", ngo.getVerificationStatus().name());
            map.put("missionStatement", ngo.getMissionStatement() != null ? ngo.getMissionStatement() : "");
            map.put("ngoCategories", ngo.getNgoCategories() != null ? ngo.getNgoCategories() : "");
            map.put("operatingLocations", ngo.getOperatingLocations() != null ? ngo.getOperatingLocations() : "");
            map.put("foundedYear", ngo.getFoundedYear());
            map.put("submittedAt", u.getCreatedAt() != null ? u.getCreatedAt().toString() : "");
            return map;
        }).toList();

        return ResponseEntity.ok(result);
    }

    @PatchMapping("/ngo-verifications/{userId}")
    public ResponseEntity<Map<String, String>> updateVerification(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID userId,
            @RequestBody Map<String, String> body) {
        AppUser admin = requireAdmin(jwt);

        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getNgoProfile() == null)
            throw new RuntimeException("NGO profile not found");

        VerificationStatus status = VerificationStatus.valueOf(body.get("status"));
        user.getNgoProfile().setVerificationStatus(status);
        userRepository.save(user);

        if (status == VerificationStatus.VERIFIED) {
            notificationWebhookService.ngoVerified(user.getAuth0Id());
            logAction(admin, "APPROVE", "NGO", userId.toString(), user.getNgoProfile().getOrganizationName());
        } else if (status == VerificationStatus.REJECTED) {
            notificationWebhookService.ngoRejected(user.getAuth0Id());
            logAction(admin, "REJECT", "NGO", userId.toString(), user.getNgoProfile().getOrganizationName());
        }

        return ResponseEntity.ok(Map.of("message", "Verification status updated"));
    }

    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers(
            @AuthenticationPrincipal Jwt jwt) {
        requireAdmin(jwt);
        List<Map<String, Object>> users = userRepository.findAll().stream().map(u ->
                Map.<String, Object>of(
                        "id", u.getId().toString(),
                        "fullName", u.getFullName() != null ? u.getFullName() : "",
                        "username", u.getUsername() != null ? u.getUsername() : "",
                        "email", u.getEmail(),
                        "role", u.getRole().name(),
                        "onboardingComplete", u.isOnboardingComplete(),
                        "suspended", u.isSuspended(),
                        "createdAt", u.getCreatedAt() != null ? u.getCreatedAt().toString() : ""
                )
        ).toList();
        return ResponseEntity.ok(users);
    }

    @PatchMapping("/users/{userId}/suspend")
    public ResponseEntity<Map<String, String>> suspendUser(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID userId,
            @RequestBody Map<String, Boolean> body) {
        AppUser admin = requireAdmin(jwt);
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        boolean suspend = Boolean.TRUE.equals(body.get("suspended"));
        user.setSuspended(suspend);
        userRepository.save(user);
        logAction(admin, suspend ? "SUSPEND" : "UPDATE", "USER", userId.toString(),
                suspend ? "User suspended" : "User reactivated");
        return ResponseEntity.ok(Map.of("message", suspend ? "User suspended" : "User reactivated"));
    }

    @GetMapping("/projects")
    public ResponseEntity<List<ProjectResponse>> getAllProjects(
            @AuthenticationPrincipal Jwt jwt) {
        requireAdmin(jwt);
        return ResponseEntity.ok(
                projectRepository.findAllWithNgo().stream()
                        .map(ProjectResponse::from).toList()
        );
    }

    @PatchMapping("/projects/{projectId}/status")
    public ResponseEntity<Map<String, String>> updateProjectStatus(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID projectId,
            @RequestBody Map<String, String> body) {
        AppUser admin = requireAdmin(jwt);
        var project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        String newStatus = body.get("status");
        project.setStatus(
                com.nconnect.coreservice.model.enums.ProjectStatus.valueOf(newStatus)
        );
        projectRepository.save(project);
        logAction(admin, "UPDATE", "PROJECT", projectId.toString(), "Status -> " + newStatus);
        return ResponseEntity.ok(Map.of("message", "Project status updated"));
    }

    @GetMapping("/resources")
    public ResponseEntity<List<ResourceResponse>> getAllResources(
            @AuthenticationPrincipal Jwt jwt) {
        requireAdmin(jwt);
        return ResponseEntity.ok(
                resourceRepository.findAllWithOwner().stream()
                        .map(ResourceResponse::from).toList()
        );
    }

    @DeleteMapping("/resources/{resourceId}")
    public ResponseEntity<Map<String, String>> deleteResource(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID resourceId) {
        AppUser admin = requireAdmin(jwt);
        resourceRepository.deleteById(resourceId);
        logAction(admin, "DELETE", "RESOURCE", resourceId.toString(), "Resource removed by admin");
        return ResponseEntity.ok(Map.of("message", "Resource removed"));
    }

    @GetMapping("/reports")
    public ResponseEntity<List<Map<String, Object>>> getReports(@AuthenticationPrincipal Jwt jwt) {
        requireAdmin(jwt);
        List<Map<String, Object>> result = reportRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(r -> Map.<String, Object>of(
                        "id", r.getId().toString(),
                        "reporterEmail", r.getReporter() != null ? r.getReporter().getEmail() : "",
                        "targetType", r.getTargetType(),
                        "targetId", r.getTargetId(),
                        "reason", r.getReason(),
                        "description", r.getDescription() != null ? r.getDescription() : "",
                        "status", r.getStatus().name(),
                        "createdAt", r.getCreatedAt().toString()
                )).toList();
        return ResponseEntity.ok(result);
    }

    @PostMapping("/reports")
    public ResponseEntity<Map<String, String>> createReport(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody Map<String, String> body) {
        AppUser reporter = userRepository.findByAuth0Id(jwt.getSubject())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Report report = new Report();
        report.setReporter(reporter);
        report.setTargetType(body.get("targetType"));
        report.setTargetId(body.get("targetId"));
        report.setReason(body.get("reason"));
        report.setDescription(body.get("description"));
        reportRepository.save(report);
        return ResponseEntity.ok(Map.of("message", "Report submitted"));
    }

    @PatchMapping("/reports/{reportId}")
    public ResponseEntity<Map<String, String>> updateReportStatus(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID reportId,
            @RequestBody Map<String, String> body) {
        AppUser admin = requireAdmin(jwt);
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        ReportStatus status = ReportStatus.valueOf(body.get("status"));
        report.setStatus(status);
        reportRepository.save(report);
        logAction(admin, status == ReportStatus.RESOLVED ? "RESOLVE" : "FLAG",
                "REPORT", reportId.toString(), "Status -> " + status.name());
        return ResponseEntity.ok(Map.of("message", "Report updated"));
    }

    @GetMapping("/donations")
    public ResponseEntity<List<Map<String, Object>>> getDonations(
            @AuthenticationPrincipal Jwt jwt) {
        requireAdmin(jwt);
        List<Map<String, Object>> records = paymentRecordRepository.findAll().stream().map(p ->
                Map.<String, Object>of(
                        "id", p.getId().toString(),
                        "userEmail", p.getUser().getEmail(),
                        "paymentMethod", p.getPaymentMethod(),
                        "paymentRef", p.getPaymentRef(),
                        "amount", p.getAmount(),
                        "purpose", p.getPurpose(),
                        "status", p.getStatus(),
                        "createdAt", p.getCreatedAt() != null ? p.getCreatedAt().toString() : ""
                )
        ).toList();
        return ResponseEntity.ok(records);
    }

    @PostMapping("/announcements")
    public ResponseEntity<Map<String, String>> sendAnnouncement(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody Map<String, String> body) {
        AppUser admin = requireAdmin(jwt);
        if (body.get("title") == null || body.get("message") == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Title and message are required"));
        }
        Announcement a = new Announcement();
        a.setTitle(body.get("title"));
        a.setMessage(body.get("message"));
        String audience = body.getOrDefault("audience", "ALL");
        a.setAudience(audience);
        a.setType(body.getOrDefault("type", "ANNOUNCEMENT"));
        a.setCreatedBy(admin.getEmail());
        announcementRepository.save(a);

        List<AppUser> targets = userRepository.findAll().stream()
                .filter(u -> switch (audience) {
                    case "USERS" -> u.getRole() == Role.USER;
                    case "NGOS" -> u.getRole() == Role.NGO;
                    default -> true;
                })
                .toList();

        for (AppUser u : targets) {
            notificationWebhookService.announcement(u.getAuth0Id(), a.getTitle(), a.getMessage());
        }

        logAction(admin, "ANNOUNCE", "ANNOUNCEMENT", a.getId().toString(), a.getTitle() + " -> " + audience);
        return ResponseEntity.ok(Map.of("message", "Announcement sent to " + targets.size() + " users"));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<List<Map<String, Object>>> getAuditLogs(@AuthenticationPrincipal Jwt jwt) {
        requireAdmin(jwt);
        List<Map<String, Object>> result = auditLogRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(l -> Map.<String, Object>of(
                        "id", l.getId().toString(),
                        "adminEmail", l.getAdminEmail(),
                        "action", l.getAction(),
                        "targetType", l.getTargetType(),
                        "targetId", l.getTargetId(),
                        "details", l.getDetails() != null ? l.getDetails() : "",
                        "createdAt", l.getCreatedAt().toString()
                )).toList();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/settings")
    public ResponseEntity<Map<String, Object>> getSettings(@AuthenticationPrincipal Jwt jwt) {
        requireAdmin(jwt);
        PlatformSettings settings = platformSettingsRepository.findAll().stream().findFirst()
                .orElseGet(PlatformSettings::new);
        List<String> categories = settings.getCategories() == null || settings.getCategories().isBlank()
                ? List.of() : List.of(settings.getCategories().split(","));
        List<String> causes = settings.getCauses() == null || settings.getCauses().isBlank()
                ? List.of() : List.of(settings.getCauses().split(","));
        return ResponseEntity.ok(Map.of("categories", categories, "causes", causes));
    }

    @PostMapping("/settings")
    public ResponseEntity<Map<String, String>> saveSettings(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody Map<String, List<String>> body) {
        AppUser admin = requireAdmin(jwt);
        PlatformSettings settings = platformSettingsRepository.findAll().stream().findFirst()
                .orElseGet(PlatformSettings::new);
        settings.setCategories(String.join(",", body.getOrDefault("categories", List.of())));
        settings.setCauses(String.join(",", body.getOrDefault("causes", List.of())));
        platformSettingsRepository.save(settings);
        logAction(admin, "UPDATE", "SETTINGS", settings.getId() != null ? settings.getId().toString() : "new",
                "Categories/causes updated");
        return ResponseEntity.ok(Map.of("message", "Settings saved"));
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics(
            @AuthenticationPrincipal Jwt jwt) {
        requireAdmin(jwt);
        long totalUsers = userRepository.count();
        long totalNgos = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.NGO).count();
        long verifiedNgos = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.NGO
                        && u.getNgoProfile() != null
                        && u.getNgoProfile().getVerificationStatus() == VerificationStatus.VERIFIED)
                .count();
        long onboardedUsers = userRepository.findAll().stream()
                .filter(AppUser::isOnboardingComplete).count();
        long activeProjects = projectRepository.findAll().stream()
                .filter(p -> p.getStatus() ==
                        com.nconnect.coreservice.model.enums.ProjectStatus.ACTIVE)
                .count();
        long totalResources = resourceRepository.count();
        long pendingVerifications = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.NGO
                        && u.getNgoProfile() != null
                        && (u.getNgoProfile().getVerificationStatus() == VerificationStatus.PENDING
                        || u.getNgoProfile().getVerificationStatus() == VerificationStatus.UNDER_REVIEW))
                .count();
        long totalDonationsNpr = paymentRecordRepository.findAll().stream()
                .mapToLong(p -> p.getAmount() != null ? p.getAmount() : 0)
                .sum();

        return ResponseEntity.ok(Map.of(
                "totalUsers", totalUsers,
                "totalNgos", totalNgos,
                "verifiedNgos", verifiedNgos,
                "onboardedUsers", onboardedUsers,
                "activeProjects", activeProjects,
                "totalResources", totalResources,
                "pendingVerifications", pendingVerifications,
                "totalDonationsNpr", totalDonationsNpr
        ));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(@AuthenticationPrincipal Jwt jwt) {
        requireAdmin(jwt);

        Map<String, Object> analytics = getAnalytics(jwt).getBody();

        List<Map<String, Object>> recentActions = auditLogRepository.findAllByOrderByCreatedAtDesc()
                .stream().limit(6)
                .map(l -> Map.<String, Object>of(
                        "action", l.getAction(),
                        "targetType", l.getTargetType(),
                        "details", l.getDetails() != null ? l.getDetails() : "",
                        "createdAt", l.getCreatedAt().toString()
                )).toList();

        List<Map<String, Object>> pendingVerifications = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.NGO && u.getNgoProfile() != null
                        && (u.getNgoProfile().getVerificationStatus() == VerificationStatus.PENDING
                        || u.getNgoProfile().getVerificationStatus() == VerificationStatus.UNDER_REVIEW))
                .limit(5)
                .map(u -> Map.<String, Object>of(
                        "name", u.getNgoProfile().getOrganizationName() != null ? u.getNgoProfile().getOrganizationName() : "",
                        "submitted", u.getCreatedAt() != null ? u.getCreatedAt().toString() : "",
                        "docs", u.getNgoProfile().getDocumentUrl() != null && !u.getNgoProfile().getDocumentUrl().isBlank()
                )).toList();

        long openReports = reportRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(r -> r.getStatus() == ReportStatus.OPEN).count();

        Map<String, Object> result = new HashMap<>(analytics);
        result.put("openReports", openReports);
        result.put("recentActions", recentActions);
        result.put("pendingVerificationsList", pendingVerifications);
        return ResponseEntity.ok(result);
    }
}