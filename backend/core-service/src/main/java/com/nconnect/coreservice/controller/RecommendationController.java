package com.nconnect.coreservice.controller;

import com.nconnect.coreservice.dto.ai.MatchScore;
import com.nconnect.coreservice.dto.ai.NgoScore;
import com.nconnect.coreservice.dto.ai.VolunteerScore;
import com.nconnect.coreservice.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/recommend")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping("/projects")
    public ResponseEntity<List<MatchScore>> recommendProjects(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(recommendationService.recommendProjectsForCurrentUser(jwt));
    }

    @GetMapping("/volunteers/{projectId}")
    public ResponseEntity<List<VolunteerScore>> recommendVolunteers(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID projectId) {
        return ResponseEntity.ok(recommendationService.recommendVolunteersForProject(jwt, projectId));
    }

    @GetMapping("/ngos")
    public ResponseEntity<List<NgoScore>> recommendNgos(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(recommendationService.recommendNgosForCurrentUser(jwt));
    }

    @PostMapping("/summarize")
    public ResponseEntity<Map<String, String>> summarize(@RequestBody Map<String, String> body) {
        String text = body.get("text");
        if (text == null || text.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "text is required"));
        }
        return ResponseEntity.ok(Map.of("summary", recommendationService.summarizeText(text)));
    }
}