package com.nconnect.coreservice.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
public class AiClientConfig {

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    @Bean
    public RestClient aiServiceClient() {
        return RestClient.builder()
                .baseUrl(aiServiceUrl)
                .requestFactory(new SimpleClientHttpRequestFactory())
                .build();
    }
}