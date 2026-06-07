package com.nconnect.coreservice.service;

import com.nconnect.coreservice.dto.ResourceCreateRequest;
import com.nconnect.coreservice.dto.ResourceResponse;
import com.nconnect.coreservice.model.AppUser;
import com.nconnect.coreservice.model.Resource;
import com.nconnect.coreservice.model.ResourceRequest;
import com.nconnect.coreservice.model.enums.ResourceStatus;
import com.nconnect.coreservice.repository.ResourceRepository;
import com.nconnect.coreservice.repository.ResourceRequestRepository;
import com.nconnect.coreservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final ResourceRequestRepository resourceRequestRepository;
    private final UserRepository userRepository;

    @Transactional
    public ResourceResponse createResource(Jwt jwt, ResourceCreateRequest req) {
        AppUser user = getUser(jwt);
        Resource resource = Resource.builder()
                .owner(user)
                .name(req.getName())
                .description(req.getDescription())
                .category(req.getCategory())
                .tags(req.getTags())
                .location(req.getLocation())
                .quantity(req.getQuantity())
                .condition(req.getCondition())
                .sharingType(req.getSharingType())
                .imageUrl(req.getImageUrl())
                .availableFrom(req.getAvailableFrom())
                .availableUntil(req.getAvailableUntil())
                .build();
        return ResourceResponse.from(resourceRepository.save(resource));
    }

    @Transactional(readOnly = true)
    public List<ResourceResponse> searchResources(String category, String status, String search) {
        String cat = (category == null || category.isBlank() || category.equals("all")) ? null : category;
        ResourceStatus st = null;
        if (status != null && !status.isBlank() && !status.equals("all")) {
            try { st = ResourceStatus.valueOf(status.toUpperCase()); } catch (Exception ignored) {}
        }
        String q = (search == null || search.isBlank()) ? null : search;
        return resourceRepository.searchResources(cat, st, q)
                .stream().map(ResourceResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public ResourceResponse getResource(UUID id) {
        return resourceRepository.findById(id)
                .map(ResourceResponse::from)
                .orElseThrow(() -> new RuntimeException("Resource not found"));
    }

    @Transactional(readOnly = true)
    public List<ResourceResponse> getMyResources(Jwt jwt) {
        AppUser user = getUser(jwt);
        return resourceRepository.findByOwnerIdOrderByCreatedAtDesc(user.getId())
                .stream().map(ResourceResponse::from).toList();
    }

    @Transactional
    public ResourceResponse updateResource(Jwt jwt, UUID id, ResourceCreateRequest req) {
        AppUser user = getUser(jwt);
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found"));
        if (!resource.getOwner().getId().equals(user.getId())) {
            throw new RuntimeException("You do not own this resource");
        }
        resource.setName(req.getName());
        resource.setDescription(req.getDescription());
        resource.setCategory(req.getCategory());
        resource.setTags(req.getTags());
        resource.setLocation(req.getLocation());
        resource.setQuantity(req.getQuantity());
        resource.setCondition(req.getCondition());
        resource.setSharingType(req.getSharingType());
        if (req.getImageUrl() != null) resource.setImageUrl(req.getImageUrl());
        resource.setAvailableFrom(req.getAvailableFrom());
        resource.setAvailableUntil(req.getAvailableUntil());
        return ResourceResponse.from(resourceRepository.save(resource));
    }

    @Transactional
    public void deleteResource(Jwt jwt, UUID id) {
        AppUser user = getUser(jwt);
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found"));
        if (!resource.getOwner().getId().equals(user.getId())) {
            throw new RuntimeException("You do not own this resource");
        }
        resourceRepository.delete(resource);
    }

    @Transactional
    public Map<String, String> requestResource(Jwt jwt, UUID resourceId, String message) {
        AppUser requester = getUser(jwt);
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new RuntimeException("Resource not found"));

        if (resource.getOwner().getId().equals(requester.getId())) {
            throw new RuntimeException("You cannot request your own resource");
        }
        if (resourceRequestRepository.existsByResourceIdAndRequesterId(resourceId, requester.getId())) {
            throw new RuntimeException("You have already requested this resource");
        }
        ResourceRequest req = ResourceRequest.builder()
                .resource(resource)
                .requester(requester)
                .message(message)
                .build();
        resourceRequestRepository.save(req);

        resource.setStatus(ResourceStatus.REQUESTED);
        resourceRepository.save(resource);

        return Map.of("message", "Resource request submitted successfully");
    }

    @Transactional
    public Map<String, String> respondToRequest(Jwt jwt, UUID requestId, boolean approve) {
        AppUser owner = getUser(jwt);
        ResourceRequest req = resourceRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!req.getResource().getOwner().getId().equals(owner.getId())) {
            throw new RuntimeException("You do not own this resource");
        }

        req.setStatus(approve ? "APPROVED" : "REJECTED");
        resourceRequestRepository.save(req);

        if (approve) {
            req.getResource().setStatus(ResourceStatus.SHARED);
            resourceRepository.save(req.getResource());
        } else {
            req.getResource().setStatus(ResourceStatus.AVAILABLE);
            resourceRepository.save(req.getResource());
        }

        return Map.of("message", approve ? "Request approved" : "Request rejected");
    }

    private AppUser getUser(Jwt jwt) {
        return userRepository.findByAuth0Id(jwt.getSubject())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}