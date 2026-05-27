package com.nconnect.coreservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class OnboardingRequest {

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 30, message = "Username must be 3-30 characters")
    private String username;
    private String role;

    private String bio;
    private String location;
    private String occupation;
    private String education;

    private List<String> skills;
    private List<String> interests;
    private List<String> languages;
    private List<String> causes;
}