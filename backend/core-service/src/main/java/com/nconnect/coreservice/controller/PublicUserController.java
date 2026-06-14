package com.nconnect.coreservice.controller;

import com.nconnect.coreservice.dto.PublicProfileResponse;
import com.nconnect.coreservice.model.AppUser;
import com.nconnect.coreservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class PublicUserController {

    private final UserRepository userRepository;

    @GetMapping("/{username}")
    public ResponseEntity<PublicProfileResponse> getByUsername(@PathVariable String username) {
        return userRepository.findByUsername(username)
                .map(user -> {
                    AppUser full = userRepository.findByAuth0IdWithCollections(user.getAuth0Id())
                            .orElse(user);
                    return ResponseEntity.ok(PublicProfileResponse.from(full));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listNgos(
            @RequestParam(required = false, defaultValue = "NGO") String role,
            @RequestParam(required = false, defaultValue = "8") int limit) {
        List<Map<String, Object>> ngos = userRepository.findAll().stream()
                .filter(u -> u.getRole().name().equals(role)
                        && u.isOnboardingComplete()
                        && u.getDeletedAt() == null
                        && u.getNgoProfile() != null)
                .limit(limit)
                .map(u -> {
                    var ngo = u.getNgoProfile();
                    return Map.<String, Object>of(
                            "id", u.getId().toString(),
                            "auth0Id", u.getAuth0Id(),
                            "username", u.getUsername() != null ? u.getUsername() : "",
                            "fullName", u.getFullName() != null ? u.getFullName() : "",
                            "organizationName", ngo.getOrganizationName() != null ? ngo.getOrganizationName() : "",
                            "profileImageUrl", u.getProfileImageUrl() != null ? u.getProfileImageUrl() : "",
                            "location", u.getLocation() != null ? u.getLocation() : "",
                            "verified", ngo.getVerificationStatus().name().equals("VERIFIED"),
                            "verificationStatus", ngo.getVerificationStatus().name(),
                            "ngoCategories", ngo.getNgoCategories() != null ? ngo.getNgoCategories() : ""
                    );
                })
                .toList();
        return ResponseEntity.ok(ngos);
    }
}