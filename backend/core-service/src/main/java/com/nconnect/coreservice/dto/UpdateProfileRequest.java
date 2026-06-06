package com.nconnect.coreservice.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.List;

@Data
public class UpdateProfileRequest {

    @Size(min = 3, max = 30, message = "Username must be 3-30 characters")
    private String username;

    private String bio;
    private String location;
    private String occupation;
    private String education;

    private List<String> skills;
    private List<String> interests;
    private List<String> languages;
    private List<String> causes;


    private String organizationName;
    private String missionStatement;
    private String ngoCategories;
    private String operatingLocations;
}