package com.nconnect.coreservice.controller;

import com.nconnect.coreservice.dto.ProjectRequest;
import com.nconnect.coreservice.dto.ProjectResponse;
import com.nconnect.coreservice.service.ProjectService;
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
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    public ResponseEntity<ProjectResponse> create(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody ProjectRequest req) {
        return ResponseEntity.ok(projectService.createProject(jwt, req));
    }

    @GetMapping
    public ResponseEntity<List<ProjectResponse>> search(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(projectService.searchProjects(category, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> get(@PathVariable UUID id) {
        return ResponseEntity.ok(projectService.getProject(id));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ProjectResponse>> myProjects(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(projectService.getMyProjects(jwt));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectResponse> update(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id,
            @Valid @RequestBody ProjectRequest req) {
        return ResponseEntity.ok(projectService.updateProject(jwt, id, req));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ProjectResponse> updateStatus(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(projectService.updateStatus(jwt, id, body.get("status")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id) {
        projectService.deleteProject(jwt, id);
        return ResponseEntity.noContent().build();
    }
}