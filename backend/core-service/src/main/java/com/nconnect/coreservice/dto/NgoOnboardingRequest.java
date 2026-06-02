package com.nconnect.coreservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.List;

@Data
public class NgoOnboardingRequest {

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 30, message = "Username must be 3-30 characters")
    private String username;

    @NotBlank(message = "Organization name is required")
    private String organizationName;

    private String missionStatement;
    private String location;

    private String ngoCategories;
    private String operatingLocations;

    private List<String> languages;
    private List<String> causes;
}