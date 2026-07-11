package com.nconnect.coreservice.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VolunteerPerformanceCandidateDto {
    private String userId;
    private String name;
    private Integer acceptedCount;
    private Integer totalApplications;
}