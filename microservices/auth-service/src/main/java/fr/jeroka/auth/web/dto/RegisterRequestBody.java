package fr.jeroka.auth.web.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.UUID;

@JsonIgnoreProperties(ignoreUnknown = true)
public record RegisterRequestBody(
        String email,
        String password,
        String confirmPassword,
        String firstName,
        String lastName,
        String phone,
        UUID companyId
) {}
