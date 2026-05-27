package com.nconnect.coreservice.controller;

import com.nconnect.coreservice.dto.OnboardingRequest;
import com.nconnect.coreservice.dto.UserProfileResponse;
import com.nconnect.coreservice.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    @PostMapping("/sync")
    public ResponseEntity<UserProfileResponse> sync(
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(userService.syncUser(jwt));
    }
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> me(
            @AuthenticationPrincipal Jwt jwt
    ) {
        return ResponseEntity.ok(userService.getProfile(jwt));
    }
    @PostMapping("/onboarding")
    public ResponseEntity<UserProfileResponse> onboarding(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody OnboardingRequest request
    ) {
        return ResponseEntity.ok(userService.completeOnboarding(jwt, request));
    }
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("NConnect Core Service is running");
    }
}