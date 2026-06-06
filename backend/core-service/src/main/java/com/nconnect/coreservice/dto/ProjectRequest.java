package com.nconnect.coreservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class ProjectRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    private String requiredSkills;
    private String tags;
    private String location;
    private String duration;
    private String beneficiaryGroup;
    private Integer volunteerSlots;
    private String priorityLevel;
    private Long goalAmount;
    private LocalDate startDate;
    private LocalDate endDate;
    private String imageUrl;
}