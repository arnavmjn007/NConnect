package com.nconnect.coreservice.service;

import com.nconnect.coreservice.dto.ProjectRequest;
import com.nconnect.coreservice.dto.ProjectResponse;
import com.nconnect.coreservice.model.AppUser;
import com.nconnect.coreservice.model.Project;
import com.nconnect.coreservice.model.enums.ProjectStatus;
import com.nconnect.coreservice.model.enums.Role;
import com.nconnect.coreservice.repository.ProjectRepository;
import com.nconnect.coreservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Transactional
    public ProjectResponse createProject(Jwt jwt, ProjectRequest req) {
        AppUser user = getUser(jwt);
        if (user.getRole() != Role.NGO) {
            throw new RuntimeException("Only NGO accounts can create projects");
        }
        Project project = Project.builder()
                .ngo(user)
                .title(req.getTitle())
                .description(req.getDescription())
                .category(req.getCategory())
                .requiredSkills(req.getRequiredSkills())
                .tags(req.getTags())
                .location(req.getLocation())
                .duration(req.getDuration())
                .beneficiaryGroup(req.getBeneficiaryGroup())
                .volunteerSlots(req.getVolunteerSlots())
                .priorityLevel(req.getPriorityLevel() != null ? req.getPriorityLevel() : "NORMAL")
                .goalAmount(req.getGoalAmount())
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .imageUrl(req.getImageUrl())
                .build();
        return ProjectResponse.from(projectRepository.save(project));
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> searchProjects(String category, String search) {
        String cat = (category == null || category.isBlank() || category.equals("all")) ? null : category;
        String q = (search == null || search.isBlank()) ? null : search;
        return projectRepository.searchProjects(cat, q)
                .stream().map(ProjectResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProject(UUID id) {
        return projectRepository.findById(id)
                .map(ProjectResponse::from)
                .orElseThrow(() -> new RuntimeException("Project not found"));
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> getMyProjects(Jwt jwt) {
        AppUser user = getUser(jwt);
        return projectRepository.findByNgoIdOrderByCreatedAtDesc(user.getId())
                .stream().map(ProjectResponse::from).toList();
    }

    @Transactional
    public ProjectResponse updateProject(Jwt jwt, UUID id, ProjectRequest req) {
        AppUser user = getUser(jwt);
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        if (!project.getNgo().getId().equals(user.getId())) {
            throw new RuntimeException("You do not own this project");
        }
        project.setTitle(req.getTitle());
        project.setDescription(req.getDescription());
        project.setCategory(req.getCategory());
        project.setRequiredSkills(req.getRequiredSkills());
        project.setTags(req.getTags());
        project.setLocation(req.getLocation());
        project.setDuration(req.getDuration());
        project.setBeneficiaryGroup(req.getBeneficiaryGroup());
        project.setVolunteerSlots(req.getVolunteerSlots());
        if (req.getPriorityLevel() != null) project.setPriorityLevel(req.getPriorityLevel());
        project.setGoalAmount(req.getGoalAmount());
        project.setStartDate(req.getStartDate());
        project.setEndDate(req.getEndDate());
        if (req.getImageUrl() != null) project.setImageUrl(req.getImageUrl());
        return ProjectResponse.from(projectRepository.save(project));
    }

    @Transactional
    public void deleteProject(Jwt jwt, UUID id) {
        AppUser user = getUser(jwt);
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        if (!project.getNgo().getId().equals(user.getId())) {
            throw new RuntimeException("You do not own this project");
        }
        projectRepository.delete(project);
    }

    @Transactional
    public ProjectResponse updateStatus(Jwt jwt, UUID id, String status) {
        AppUser user = getUser(jwt);
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found"));
        if (!project.getNgo().getId().equals(user.getId())) {
            throw new RuntimeException("You do not own this project");
        }
        project.setStatus(ProjectStatus.valueOf(status));
        return ProjectResponse.from(projectRepository.save(project));
    }

    private AppUser getUser(Jwt jwt) {
        return userRepository.findByAuth0Id(jwt.getSubject())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}