package com.nconnect.coreservice.service;

import com.nconnect.coreservice.dto.ai.*;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AiClientService {

    private final RestClient aiServiceClient;

    public List<MatchScore> recommendProjects(ProjectRecommendationRequest request) {
        return aiServiceClient.post()
                .uri("/recommend/projects")
                .body(request)
                .retrieve()
                .body(new ParameterizedTypeReference<List<MatchScore>>() {
                });
    }

    public List<VolunteerScore> recommendVolunteers(VolunteerRecommendationRequest request) {
        return aiServiceClient.post()
                .uri("/recommend/volunteers")
                .body(request)
                .retrieve()
                .body(new ParameterizedTypeReference<List<VolunteerScore>>() {
                });
    }

    public List<NgoScore> recommendNgos(NgoRecommendationRequest request) {
        return aiServiceClient.post()
                .uri("/recommend/ngos")
                .body(request)
                .retrieve()
                .body(new ParameterizedTypeReference<List<NgoScore>>() {
                });
    }

    public String summarize(String text) {
        SummarizeResponse res = aiServiceClient.post()
                .uri("/summarize")
                .body(new SummarizeRequest(text))
                .retrieve()
                .body(SummarizeResponse.class);
        return res != null ? res.getSummary() : "";
    }

    public List<VolunteerPerformanceScore> scoreVolunteerPerformance(VolunteerPerformanceRequest request) {
        try {
            return aiServiceClient.post()
                    .uri("/performance/volunteers")
                    .body(request)
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<VolunteerPerformanceScore>>() {
                    });
        } catch (RestClientResponseException e) {
            System.out.println("AI SERVICE ERROR BODY: " + e.getResponseBodyAsString());
            throw e;
        }
    }

    public List<ProjectPerformanceScore> scoreProjectPerformance(ProjectPerformanceRequest request) {
        try {
            return aiServiceClient.post()
                    .uri("/performance/projects")
                    .body(request)
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<ProjectPerformanceScore>>() {
                    });
        } catch (RestClientResponseException e) {
            System.out.println("AI SERVICE ERROR BODY: " + e.getResponseBodyAsString());
            throw e;
        }
    }
}