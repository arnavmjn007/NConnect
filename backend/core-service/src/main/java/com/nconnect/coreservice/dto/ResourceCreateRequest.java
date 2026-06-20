package com.nconnect.coreservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;

@Data
public class ResourceCreateRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    private String tags;
    private String location;
    private Integer quantity;
    private String condition;
    private String sharingType;
    private String imageUrl;
    private LocalDate availableFrom;
    private LocalDate availableUntil;
    private String resourceType = "OFFER";
    private String urgency;
}