package fr.jeroka.apijava.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "Email requis")
        @Email
        String email,
        @NotBlank(message = "Mot de passe requis")
        String password
) {}
