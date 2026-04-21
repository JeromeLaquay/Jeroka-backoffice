package fr.jeroka.auth.web.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;

@JsonIgnoreProperties(ignoreUnknown = true)
public record UpdateProfileRequestBody(
        @NotBlank String firstName,
        @NotBlank String lastName,
        String phone
) {}
