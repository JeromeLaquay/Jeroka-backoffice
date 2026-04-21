package fr.jeroka.organization.web.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record UpdateCompanyRequestDto(
        String name,
        String legalName,
        String siret,
        String vatNumber,
        String addressLine1,
        String addressLine2,
        String city,
        String postalCode,
        String country,
        String phone,
        String email,
        String website,
        String description,
        String industry
) {}
