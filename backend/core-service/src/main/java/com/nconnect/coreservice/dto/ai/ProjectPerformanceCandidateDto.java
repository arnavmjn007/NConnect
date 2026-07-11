package com.nconnect.coreservice.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectPerformanceCandidateDto {
    private String projectId;
    private String title;
    private Integer volunteersJoined;
    private Integer volunteerSlots;
    private Long raisedAmount;
    private Long goalAmount;
}