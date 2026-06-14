package com.nconnect.coreservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.HashMap;

@Service
public class NotificationWebhookService {

    @Value("${feed.service.url:http://localhost:5000}")
    private String feedServiceUrl;

    @Value("${feed.service.internal-secret:nconnect_internal_secret_2026}")
    private String internalSecret;

    private final RestTemplate restTemplate = new RestTemplate();

    public void sendEvent(String type, String actorId, String recipientId,
                          String entityType, String entityId, Map<String, Object> metadata) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-internal-secret", internalSecret);

            Map<String, Object> body = new HashMap<>();
            body.put("type", type);
            body.put("actor_id", actorId);
            body.put("recipient_id", recipientId);
            body.put("entity_type", entityType);
            body.put("entity_id", entityId);
            body.put("metadata", metadata != null ? metadata : new HashMap<>());

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            restTemplate.postForEntity(
                    feedServiceUrl + "/notifications/internal/event",
                    request,
                    Map.class
            );
        } catch (Exception e) {
            // Never fail the main flow if notification fails
            System.err.println("Notification webhook failed: " + e.getMessage());
        }
    }

    // Convenience methods
    public void ngoVerified(String ngoAuth0Id) {
        sendEvent("NGO_VERIFIED", null, ngoAuth0Id, "NGO", ngoAuth0Id, null);
    }

    public void ngoRejected(String ngoAuth0Id) {
        sendEvent("NGO_REJECTED", null, ngoAuth0Id, "NGO", ngoAuth0Id, null);
    }

    public void resourceRequested(String requesterAuth0Id, String ownerAuth0Id,
                                  String resourceId, String resourceName) {
        Map<String, Object> meta = Map.of("resourceName", resourceName);
        sendEvent("RESOURCE_REQUEST", requesterAuth0Id, ownerAuth0Id,
                "RESOURCE", resourceId, meta);
    }

    public void resourceApproved(String requesterAuth0Id, String resourceId, String resourceName) {
        Map<String, Object> meta = Map.of("resourceName", resourceName);
        sendEvent("RESOURCE_APPROVED", null, requesterAuth0Id,
                "RESOURCE", resourceId, meta);
    }

    public void projectApplication(String applicantAuth0Id, String ngoAuth0Id,
                                   String projectId, String projectName) {
        Map<String, Object> meta = Map.of("projectName", projectName);
        sendEvent("PROJECT_APPLICATION", applicantAuth0Id, ngoAuth0Id,
                "PROJECT", projectId, meta);
    }

    public void projectAccepted(String applicantAuth0Id, String projectId, String projectName) {
        Map<String, Object> meta = Map.of("projectName", projectName);
        sendEvent("PROJECT_ACCEPTED", null, applicantAuth0Id,
                "PROJECT", projectId, meta);
    }

    public void donationReceived(String ngoAuth0Id, String projectId, long amount) {
        Map<String, Object> meta = Map.of("amount", amount);
        sendEvent("DONATION_RECEIVED", null, ngoAuth0Id,
                "PROJECT", projectId, meta);
    }

    public void donationConfirmed(String donorAuth0Id, String projectId, long amount) {
        Map<String, Object> meta = Map.of("amount", amount);
        sendEvent("DONATION_CONFIRMED", null, donorAuth0Id,
                "PROJECT", projectId, meta);
    }
}