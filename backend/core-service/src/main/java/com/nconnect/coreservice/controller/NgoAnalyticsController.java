package com.nconnect.coreservice.controller;

import com.nconnect.coreservice.model.AppUser;
import com.nconnect.coreservice.model.enums.Role;
import com.nconnect.coreservice.repository.UserRepository;
import com.nconnect.coreservice.service.NgoAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/ngo/analytics")
@RequiredArgsConstructor
public class NgoAnalyticsController {

    private final UserRepository userRepository;
    private final NgoAnalyticsService ngoAnalyticsService;

    @GetMapping("/pro")
    public ResponseEntity<?> getProAnalytics(@AuthenticationPrincipal Jwt jwt) {
        AppUser user = userRepository.findByAuth0Id(jwt.getSubject()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }
        if (user.getRole() != Role.NGO) {
            return ResponseEntity.status(403).body(Map.of("error", "NGO access required"));
        }
        boolean isPro = user.getProExpiresAt() != null && user.getProExpiresAt().isAfter(LocalDateTime.now());
        if (!isPro) {
            return ResponseEntity.status(403).body(Map.of("error", "Pro subscription required"));
        }
        return ResponseEntity.ok(ngoAnalyticsService.buildProAnalytics(user));
    }
}