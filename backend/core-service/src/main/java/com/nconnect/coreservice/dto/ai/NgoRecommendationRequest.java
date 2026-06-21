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
public class NgoRecommendationRequest {
    private List<String> interests;
    private String location;
    private List<String> volunteeredCategories;
    private List<String> donatedCategories;
    private Integer donationCount;
    private List<NgoCandidateDto> ngos;
}