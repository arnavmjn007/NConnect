package com.nconnect.coreservice.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class SearchResponse {

    private List<UserResult> users;
    private List<NgoResult> ngos;
    private List<ProjectResult> projects;
    private List<ResourceResult> resources;

    @Data
    @Builder
    public static class UserResult {
        private String id;
        private String auth0Id;
        private String username;
        private String fullName;
        private String bio;
        private String occupation;
        private String location;
        private String profileImageUrl;
        private String role;
    }

    @Data
    @Builder
    public static class NgoResult {
        private String id;
        private String userId;
        private String username;
        private String organizationName;
        private String missionStatement;
        private String location;
        private String ngoCategories;
        private String verificationStatus;
        private boolean verified;
    }

    @Data
    @Builder
    public static class ProjectResult {
        private String id;
        private String title;
        private String description;
        private String category;
        private String location;
        private String ngoName;
        private String status;
        private String priorityLevel;
        private Long goalAmount;
        private Long raisedAmount;
    }

    @Data
    @Builder
    public static class ResourceResult {
        private String id;
        private String name;
        private String description;
        private String category;
        private String location;
        private String ownerName;
        private String status;
        private String sharingType;
        private String condition;
    }
}