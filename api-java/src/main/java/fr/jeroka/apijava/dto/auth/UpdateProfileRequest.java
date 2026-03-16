package fr.jeroka.apijava.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record UpdateProfileRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        String phone
) {
}

