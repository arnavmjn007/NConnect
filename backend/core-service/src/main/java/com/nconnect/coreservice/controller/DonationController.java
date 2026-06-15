package com.nconnect.coreservice.controller;

import com.nconnect.coreservice.model.AppUser;
import com.nconnect.coreservice.model.PaymentRecord;
import com.nconnect.coreservice.model.Project;
import com.nconnect.coreservice.repository.PaymentRecordRepository;
import com.nconnect.coreservice.repository.ProjectRepository;
import com.nconnect.coreservice.repository.UserRepository;
import com.nconnect.coreservice.service.NotificationWebhookService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/donations")
@RequiredArgsConstructor
public class DonationController {

    private final ProjectRepository projectRepository;
    private final PaymentRecordRepository paymentRecordRepository;
    private final UserRepository userRepository;
    private final NotificationWebhookService notificationWebhookService;

    @Value("${feed.service.internal-secret:nconnect_internal_secret_2026}")
    private String internalSecret;

    @PostMapping("/confirm")
    public ResponseEntity<Map<String, Object>> confirmDonation(
            @RequestHeader("x-internal-secret") String secret,
            @RequestBody Map<String, Object> body) {

        if (!internalSecret.equals(secret)) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        String projectId = (String) body.get("projectId");
        String donorAuth0Id = (String) body.get("donorAuth0Id");
        String paymentRef = (String) body.get("paymentRef");
        String paymentMethod = (String) body.get("paymentMethod");
        Object amountObj = body.get("amount");

        if (projectId == null || paymentRef == null || amountObj == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "projectId, paymentRef, amount required"));
        }

        long amount = ((Number) amountObj).longValue();

        try {
            Project project = projectRepository.findById(UUID.fromString(projectId))
                    .orElseThrow(() -> new RuntimeException("Project not found"));

            project.setRaisedAmount((project.getRaisedAmount() != null ? project.getRaisedAmount() : 0L) + amount);
            project.setDonorCount((project.getDonorCount() != null ? project.getDonorCount() : 0) + 1);
            projectRepository.save(project);

            AppUser donor = null;
            if (donorAuth0Id != null) {
                donor = userRepository.findByAuth0Id(donorAuth0Id).orElse(null);
            }
            if (donor != null) {
                PaymentRecord record = PaymentRecord.builder()
                        .user(donor)
                        .paymentMethod(paymentMethod != null ? paymentMethod : "STRIPE")
                        .paymentRef(paymentRef)
                        .amount((int) amount)
                        .purpose("project_donation:" + projectId)
                        .status("COMPLETED")
                        .build();
                paymentRecordRepository.save(record);
            }

            boolean goalReached = project.getGoalAmount() != null
                    && project.getRaisedAmount() >= project.getGoalAmount();

            if (donorAuth0Id != null) {
                notificationWebhookService.donationConfirmed(donorAuth0Id, projectId, amount);
            }
            if (project.getNgo() != null) {
                notificationWebhookService.donationReceived(
                        project.getNgo().getAuth0Id(), projectId, amount);
                if (goalReached) {
                    notificationWebhookService.sendEvent(
                            "DONATION_GOAL_REACHED", null,
                            project.getNgo().getAuth0Id(),
                            "PROJECT", projectId,
                            Map.of("projectName", project.getTitle())
                    );
                }
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "raisedAmount", project.getRaisedAmount(),
                    "donorCount", project.getDonorCount(),
                    "goalReached", goalReached
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my")
    public ResponseEntity<?> myDonations(
            @RequestHeader(value = "Authorization", required = false) String auth) {
        return ResponseEntity.ok(Map.of("message", "Use /api/user/me for profile"));
    }
}