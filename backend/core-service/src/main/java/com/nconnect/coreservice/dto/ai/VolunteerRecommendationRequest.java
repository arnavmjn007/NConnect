package com.nconnect.coreservice.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VolunteerRecommendationRequest {
    private String projectId;
    private List<String> requiredSkills;
    private String category;
    private String location;
    private List<VolunteerCandidateDto> candidates;
}