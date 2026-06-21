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
public class VolunteerCandidateDto {
    private String userId;
    private List<String> skills;
    private List<String> interests;
    private String location;
}