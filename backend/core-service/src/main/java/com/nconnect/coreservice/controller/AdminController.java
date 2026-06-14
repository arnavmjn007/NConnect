package com.nconnect.coreservice.controller;

import com.nconnect.coreservice.dto.ProjectResponse;
import com.nconnect.coreservice.dto.ResourceResponse;
import com.nconnect.coreservice.dto.UserProfileResponse;
import com.nconnect.coreservice.model.AppUser;
import com.nconnect.coreservice.model.PaymentRecord;
import com.nconnect.coreservice.model.enums.Role;
import com.nconnect.coreservice.model.enums.VerificationStatus;
import com.nconnect.coreservice.repository.PaymentRecordRepository;
import com.nconnect.coreservice.repository.ProjectRepository;
import com.nconnect.coreservice.repository.ResourceRepository;
import com.nconnect.coreservice.repository.UserRepository;
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
    private final NotificationWebhookService notificationWebhookService;

    private void requireAdmin(Jwt jwt) {
        AppUser user = userRepository.findByAuth0Id(jwt.getSubject())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getRole() != Role.ADMIN) {
            throw new RuntimeException("Admin access required");
        }
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
            return map;
        }).toList();

        return ResponseEntity.ok(result);
    }

    @PatchMapping("/ngo-verifications/{userId}")
    public ResponseEntity<Map<String, String>> updateVerification(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID userId,
            @RequestBody Map<String, String> body) {
        requireAdmin(jwt);

        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getNgoProfile() == null)
            throw new RuntimeException("NGO profile not found");

        VerificationStatus status = VerificationStatus.valueOf(body.get("status"));
        user.getNgoProfile().setVerificationStatus(status);
        userRepository.save(user);

        if (status == VerificationStatus.VERIFIED) {
            notificationWebhookService.ngoVerified(user.getAuth0Id());
        } else if (status == VerificationStatus.REJECTED) {
            notificationWebhookService.ngoRejected(user.getAuth0Id());
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
                        "createdAt", u.getCreatedAt() != null ? u.getCreatedAt().toString() : ""
                )
        ).toList();
        return ResponseEntity.ok(users);
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
        requireAdmin(jwt);
        var project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        project.setStatus(
                com.nconnect.coreservice.model.enums.ProjectStatus.valueOf(body.get("status"))
        );
        projectRepository.save(project);
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
        requireAdmin(jwt);
        resourceRepository.deleteById(resourceId);
        return ResponseEntity.ok(Map.of("message", "Resource removed"));
    }

    @GetMapping("/reports")
    public ResponseEntity<List<Object>> getReports(@AuthenticationPrincipal Jwt jwt) {
        requireAdmin(jwt);
        return ResponseEntity.ok(List.of());
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
    }}