package com.nconnect.coreservice.controller;

import com.nconnect.coreservice.dto.PublicProfileResponse;
import com.nconnect.coreservice.model.AppUser;
import com.nconnect.coreservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

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
    public ResponseEntity<List<Map<String, Object>>> listUsers(
            @RequestParam(required = false, defaultValue = "NGO") String role,
            @RequestParam(required = false, defaultValue = "8") int limit,
            @RequestParam(required = false) String auth0Id,
            @RequestParam(required = false) String search) {

        if (auth0Id != null && !auth0Id.isBlank()) {
            return userRepository.findByAuth0Id(auth0Id).map(u -> {
                var ngo = u.getNgoProfile();
                String name = ngo != null && ngo.getOrganizationName() != null
                        ? ngo.getOrganizationName()
                        : u.getFullName() != null ? u.getFullName()
                        : u.getUsername();
                return ResponseEntity.ok(List.of(Map.<String, Object>of(
                        "auth0Id", u.getAuth0Id(),
                        "username", u.getUsername() != null ? u.getUsername() : "",
                        "fullName", u.getFullName() != null ? u.getFullName() : "",
                        "organizationName", ngo != null && ngo.getOrganizationName() != null
                                ? ngo.getOrganizationName() : "",
                        "profileImageUrl", u.getProfileImageUrl() != null ? u.getProfileImageUrl() : "",
                        "displayName", name != null ? name : "",
                        "verified", ngo != null && ngo.getVerificationStatus() != null
                                && ngo.getVerificationStatus().name().equals("VERIFIED")
                )));
            }).orElse(ResponseEntity.ok(List.of()));
        }

        if (search != null && !search.isBlank()) {
            String lower = search.toLowerCase();
            List<Map<String, Object>> result = userRepository.findAll().stream()
                    .filter(u -> u.getDeletedAt() == null
                            && u.isOnboardingComplete()
                            && (
                            (u.getUsername() != null && u.getUsername().toLowerCase().contains(lower))
                                    || (u.getFullName() != null && u.getFullName().toLowerCase().contains(lower))
                                    || (u.getNgoProfile() != null && u.getNgoProfile().getOrganizationName() != null
                                    && u.getNgoProfile().getOrganizationName().toLowerCase().contains(lower))
                    ))
                    .limit(20)
                    .map(u -> {
                        var ngo = u.getNgoProfile();
                        String name = ngo != null && ngo.getOrganizationName() != null
                                ? ngo.getOrganizationName()
                                : u.getFullName() != null ? u.getFullName() : u.getUsername();
                        return Map.<String, Object>of(
                                "auth0Id", u.getAuth0Id(),
                                "username", u.getUsername() != null ? u.getUsername() : "",
                                "fullName", u.getFullName() != null ? u.getFullName() : "",
                                "organizationName", ngo != null && ngo.getOrganizationName() != null
                                        ? ngo.getOrganizationName() : "",
                                "profileImageUrl", u.getProfileImageUrl() != null ? u.getProfileImageUrl() : "",
                                "displayName", name != null ? name : "",
                                "verified", ngo != null && ngo.getVerificationStatus() != null
                                        && ngo.getVerificationStatus().name().equals("VERIFIED")
                        );
                    })
                    .toList();
            return ResponseEntity.ok(result);
        }

        List<Map<String, Object>> users = userRepository.findAll().stream()
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
        return ResponseEntity.ok(users);
    }

    @PostMapping("/batch")
    public ResponseEntity<List<Map<String, Object>>> getByIds(@RequestBody List<String> ids) {
        List<UUID> uuids = ids.stream()
                .map(this::safeParseUuid)
                .filter(id -> id != null)
                .toList();

        List<Map<String, Object>> result = userRepository.findAllById(uuids).stream()
                .map(u -> {
                    var ngo = u.getNgoProfile();
                    return Map.<String, Object>of(
                            "id", u.getId().toString(),
                            "username", u.getUsername() != null ? u.getUsername() : "",
                            "fullName", u.getFullName() != null ? u.getFullName() : "",
                            "profileImageUrl", u.getProfileImageUrl() != null ? u.getProfileImageUrl() : "",
                            "verified", ngo != null && ngo.getVerificationStatus() != null
                                    && ngo.getVerificationStatus().name().equals("VERIFIED")
                    );
                })
                .toList();

        return ResponseEntity.ok(result);
    }

    private UUID safeParseUuid(String s) {
        try {
            return UUID.fromString(s);
        } catch (Exception e) {
            return null;
        }
    }
}