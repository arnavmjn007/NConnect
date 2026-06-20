package com.nconnect.coreservice.dto;

import com.nconnect.coreservice.model.Resource;
import com.nconnect.coreservice.model.enums.ResourceStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class ResourceResponse {

    private UUID id;
    private UUID ownerId;
    private String ownerName;
    private String ownerUsername;
    private boolean ownerVerified;

    private String name;
    private String description;
    private String category;
    private List<String> tags;
    private String location;
    private Integer quantity;
    private String condition;
    private String sharingType;
    private String imageUrl;
    private LocalDate availableFrom;
    private LocalDate availableUntil;
    private ResourceStatus status;
    private String resourceType;
    private String urgency;
    private LocalDateTime createdAt;

    public static ResourceResponse from(Resource r) {
        return ResourceResponse.builder()
                .id(r.getId())
                .ownerId(r.getOwner().getId())
                .ownerName(r.getOwner().getNgoProfile() != null
                        ? r.getOwner().getNgoProfile().getOrganizationName()
                        : r.getOwner().getFullName())
                .ownerUsername(r.getOwner().getUsername())
                .ownerVerified(r.getOwner().getNgoProfile() != null &&
                        r.getOwner().getNgoProfile().getVerificationStatus()
                                == com.nconnect.coreservice.model.enums.VerificationStatus.VERIFIED)
                .name(r.getName())
                .description(r.getDescription())
                .category(r.getCategory())
                .tags(splitCsv(r.getTags()))
                .location(r.getLocation())
                .quantity(r.getQuantity())
                .condition(r.getCondition())
                .sharingType(r.getSharingType())
                .imageUrl(r.getImageUrl())
                .availableFrom(r.getAvailableFrom())
                .availableUntil(r.getAvailableUntil())
                .status(r.getStatus())
                .resourceType(r.getResourceType() != null ? r.getResourceType() : "OFFER")
                .urgency(r.getUrgency())
                .createdAt(r.getCreatedAt())
                .build();
    }

    private static List<String> splitCsv(String value) {
        if (value == null || value.isBlank()) return List.of();
        return Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }
}