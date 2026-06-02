package com.nconnect.coreservice.controller;

import com.nconnect.coreservice.dto.*;
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
    public ResponseEntity<UserProfileResponse> sync(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(userService.syncUser(jwt));
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> me(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(userService.getProfile(jwt));
    }

    // Separate onboarding endpoints
    @PostMapping("/onboarding/user")
    public ResponseEntity<UserProfileResponse> onboardUser(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody UserOnboardingRequest request) {
        return ResponseEntity.ok(userService.completeUserOnboarding(jwt, request));
    }

    @PostMapping("/onboarding/ngo")
    public ResponseEntity<UserProfileResponse> onboardNgo(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody NgoOnboardingRequest request) {
        return ResponseEntity.ok(userService.completeNgoOnboarding(jwt, request));
    }

    @PostMapping("/verification")
    public ResponseEntity<UserProfileResponse> submitVerification(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody NgoVerificationRequest request) {
        return ResponseEntity.ok(userService.submitNgoVerification(jwt, request));
    }

    @PatchMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(jwt, request));
    }

    @DeleteMapping("/account")
    public ResponseEntity<Void> deleteAccount(@AuthenticationPrincipal Jwt jwt) {
        userService.deleteAccount(jwt);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("NConnect Core Service is running");
    }
}