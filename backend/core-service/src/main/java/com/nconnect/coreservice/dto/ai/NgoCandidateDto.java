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
public class NgoCandidateDto {
    private String ngoId;
    private String organizationName;
    private List<String> categories;
    private String location;
}