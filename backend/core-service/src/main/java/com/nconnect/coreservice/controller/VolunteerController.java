package com.nconnect.coreservice.controller;

import com.nconnect.coreservice.model.AppUser;
import com.nconnect.coreservice.model.Project;
import com.nconnect.coreservice.model.VolunteerApplication;
import com.nconnect.coreservice.model.enums.Role;
import com.nconnect.coreservice.repository.ProjectRepository;
import com.nconnect.coreservice.repository.UserRepository;
import com.nconnect.coreservice.repository.VolunteerApplicationRepository;
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
@RequestMapping("/api/volunteer")
@RequiredArgsConstructor
public class VolunteerController {

    private final VolunteerApplicationRepository applicationRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final NotificationWebhookService notificationWebhookService;

    @PostMapping("/{projectId}/apply")
    public ResponseEntity<Map<String, Object>> apply(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID projectId,
            @RequestBody(required = false) Map<String, String> body) {

        AppUser applicant = getUser(jwt);
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (applicationRepository.existsByProjectIdAndApplicantId(projectId, applicant.getId())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Already applied"));
        }

        String message = body != null ? body.getOrDefault("message", "") : "";

        VolunteerApplication app = VolunteerApplication.builder()
                .project(project)
                .applicant(applicant)
                .message(message)
                .status("PENDING")
                .build();
        applicationRepository.save(app);

        notificationWebhookService.projectApplication(
                applicant.getAuth0Id(),
                project.getNgo().getAuth0Id(),
                projectId.toString(),
                project.getTitle()
        );

        return ResponseEntity.ok(Map.of(
                "success", true,
                "applicationId", app.getId().toString(),
                "status", "PENDING"
        ));
    }

    @GetMapping("/{projectId}/applications")
    public ResponseEntity<List<Map<String, Object>>> getApplications(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID projectId) {

        AppUser ngo = getUser(jwt);
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!project.getNgo().getId().equals(ngo.getId())) {
            return ResponseEntity.status(403).body(List.of());
        }

        List<Map<String, Object>> result = applicationRepository
                .findByProjectIdOrderByCreatedAtDesc(projectId)
                .stream()
                .map(a -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", a.getId().toString());
                    map.put("applicantId", a.getApplicant().getId().toString());
                    map.put("applicantName", a.getApplicant().getFullName() != null
                            ? a.getApplicant().getFullName() : a.getApplicant().getUsername());
                    map.put("applicantUsername", a.getApplicant().getUsername());
                    map.put("applicantImage", a.getApplicant().getProfileImageUrl());
                    map.put("message", a.getMessage());
                    map.put("status", a.getStatus());
                    map.put("createdAt", a.getCreatedAt() != null ? a.getCreatedAt().toString() : "");
                    return map;
                })
                .toList();

        return ResponseEntity.ok(result);
    }

    @PatchMapping("/applications/{applicationId}/respond")
    public ResponseEntity<Map<String, Object>> respond(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID applicationId,
            @RequestBody Map<String, String> body) {

        AppUser ngo = getUser(jwt);
        VolunteerApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if (!app.getProject().getNgo().getId().equals(ngo.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Not your project"));
        }

        String action = body.get("action"); // ACCEPTED or REJECTED
        if (!"ACCEPTED".equals(action) && !"REJECTED".equals(action)) {
            return ResponseEntity.badRequest().body(Map.of("error", "action must be ACCEPTED or REJECTED"));
        }

        app.setStatus(action);
        applicationRepository.save(app);

        Project project = app.getProject();

        if ("ACCEPTED".equals(action)) {
            project.setVolunteersJoined(
                    (project.getVolunteersJoined() != null ? project.getVolunteersJoined() : 0) + 1
            );
            projectRepository.save(project);

            notificationWebhookService.projectAccepted(
                    app.getApplicant().getAuth0Id(),
                    project.getId().toString(),
                    project.getTitle()
            );
        } else {
            notificationWebhookService.sendEvent(
                    "PROJECT_REJECTED",
                    null,
                    app.getApplicant().getAuth0Id(),
                    "PROJECT",
                    project.getId().toString(),
                    Map.of("projectName", project.getTitle())
            );
        }

        return ResponseEntity.ok(Map.of("success", true, "status", action));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Map<String, Object>>> myApplications(@AuthenticationPrincipal Jwt jwt) {
        AppUser user = getUser(jwt);
        List<Map<String, Object>> result = applicationRepository
                .findByApplicantIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(a -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", a.getId().toString());
                    map.put("projectId", a.getProject().getId().toString());
                    map.put("projectTitle", a.getProject().getTitle());
                    map.put("projectCategory", a.getProject().getCategory());
                    map.put("ngoName", a.getProject().getNgo().getNgoProfile() != null
                            ? a.getProject().getNgo().getNgoProfile().getOrganizationName()
                            : a.getProject().getNgo().getFullName());
                    map.put("status", a.getStatus());
                    map.put("createdAt", a.getCreatedAt() != null ? a.getCreatedAt().toString() : "");
                    return map;
                })
                .toList();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{projectId}/status")
    public ResponseEntity<Map<String, Object>> myStatus(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID projectId) {
        AppUser user = getUser(jwt);
        var app = applicationRepository.findByProjectIdAndApplicantId(projectId, user.getId());
        if (app.isEmpty()) {
            return ResponseEntity.ok(Map.of("applied", false));
        }
        return ResponseEntity.ok(Map.of(
                "applied", true,
                "status", app.get().getStatus(),
                "applicationId", app.get().getId().toString()
        ));
    }

    private AppUser getUser(Jwt jwt) {
        return userRepository.findByAuth0Id(jwt.getSubject())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}