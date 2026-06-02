package com.nconnect.coreservice.dto;

import lombok.Data;

@Data
public class NgoVerificationRequest {
    private String registrationNumber;
    private String websiteUrl;
    private Integer foundedYear;
    private String documentUrl;
    private String paymentMethod;
    private String paymentIntentId;
}