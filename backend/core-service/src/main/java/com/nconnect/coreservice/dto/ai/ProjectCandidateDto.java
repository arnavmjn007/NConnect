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
public class ProjectCandidateDto {
    private String projectId;
    private String title;
    private String category;
    private List<String> requiredSkills;
    private List<String> tags;
    private String location;
}