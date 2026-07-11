package com.nconnect.coreservice.dto.ai;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectPerformanceScore {
    private String projectId;
    private String title;
    private Integer score;
}