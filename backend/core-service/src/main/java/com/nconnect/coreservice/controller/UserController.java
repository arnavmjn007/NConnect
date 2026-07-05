package com.nconnect.coreservice.controller;

import com.nconnect.coreservice.dto.*;
import com.nconnect.coreservice.model.AppUser;
import com.nconnect.coreservice.repository.PaymentRecordRepository;
import com.nconnect.coreservice.repository.UserRepository;
import com.nconnect.coreservice.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import com.nconnect.coreservice.model.PaymentRecord;
import com.nconnect.coreservice.repository.PaymentRecordRepository;

import java.time.LocalDateTime;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final PaymentRecordRepository paymentRecordRepository;
    private final UserRepository userRepository;

    @PostMapping("/sync")
    public ResponseEntity<UserProfileResponse> sync(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(userService.syncUser(jwt));
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> me(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(userService.getProfile(jwt));
    }

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

    @PostMapping("/subscription/confirm")
    public ResponseEntity<?> confirmSubscription(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody Map<String, Object> body) {

        String plan = (String) body.get("plan");
        String paymentRef = (String) body.get("paymentRef");
        String paymentMethod = (String) body.get("paymentMethod");
        Object amountObj = body.get("amount");

        if (plan == null || paymentRef == null || amountObj == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "plan, paymentRef, amount required"));
        }

        AppUser user = userRepository.findByAuth0Id(jwt.getSubject())
                .orElseThrow(() -> new RuntimeException("User not found"));

        long amount = ((Number) amountObj).longValue();
        int days = "YEARLY".equalsIgnoreCase(plan) ? 365 : 30;

        LocalDateTime base = (user.getProExpiresAt() != null && user.getProExpiresAt().isAfter(LocalDateTime.now()))
                ? user.getProExpiresAt()
                : LocalDateTime.now();
        user.setProExpiresAt(base.plusDays(days));
        userRepository.save(user);

        PaymentRecord record = PaymentRecord.builder()
                .user(user)
                .paymentMethod(paymentMethod != null ? paymentMethod : "STRIPE")
                .paymentRef(paymentRef)
                .amount((int) amount)
                .purpose("pro_subscription:" + plan)
                .status("COMPLETED")
                .build();
        paymentRecordRepository.save(record);

        return ResponseEntity.ok(UserProfileResponse.from(user));
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

    @GetMapping("/my-donations")
    public ResponseEntity<List<Map<String, Object>>> myDonations(
            @AuthenticationPrincipal Jwt jwt) {
        AppUser user = userRepository.findByAuth0Id(jwt.getSubject())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Map<String, Object>> records = paymentRecordRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(p -> Map.<String, Object>of(
                        "id", p.getId().toString(),
                        "amount", p.getAmount(),
                        "paymentMethod", p.getPaymentMethod(),
                        "paymentRef", p.getPaymentRef(),
                        "purpose", p.getPurpose() != null ? p.getPurpose() : "",
                        "status", p.getStatus(),
                        "createdAt", p.getCreatedAt() != null ? p.getCreatedAt().toString() : ""
                ))
                .toList();

        return ResponseEntity.ok(records);
    }
}