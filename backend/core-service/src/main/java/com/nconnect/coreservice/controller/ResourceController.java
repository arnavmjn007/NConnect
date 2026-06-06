package com.nconnect.coreservice.controller;

import com.nconnect.coreservice.dto.ResourceCreateRequest;
import com.nconnect.coreservice.dto.ResourceResponse;
import com.nconnect.coreservice.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    @PostMapping
    public ResponseEntity<ResourceResponse> create(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody ResourceCreateRequest req) {
        return ResponseEntity.ok(resourceService.createResource(jwt, req));
    }

    @GetMapping
    public ResponseEntity<List<ResourceResponse>> search(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(resourceService.searchResources(category, status, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponse> get(@PathVariable UUID id) {
        return ResponseEntity.ok(resourceService.getResource(id));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ResourceResponse>> myResources(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(resourceService.getMyResources(jwt));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResourceResponse> update(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id,
            @Valid @RequestBody ResourceCreateRequest req) {
        return ResponseEntity.ok(resourceService.updateResource(jwt, id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id) {
        resourceService.deleteResource(jwt, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/request")
    public ResponseEntity<Map<String, String>> requestResource(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body) {
        String message = body != null ? body.get("message") : null;
        return ResponseEntity.ok(resourceService.requestResource(jwt, id, message));
    }

    @PatchMapping("/requests/{requestId}/respond")
    public ResponseEntity<Map<String, String>> respond(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID requestId,
            @RequestBody Map<String, Boolean> body) {
        return ResponseEntity.ok(resourceService.respondToRequest(jwt, requestId, body.get("approve")));
    }
}