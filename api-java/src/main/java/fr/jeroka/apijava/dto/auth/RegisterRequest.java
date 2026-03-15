package fr.jeroka.apijava.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record RegisterRequest(
        @NotBlank(message = "Email requis")
        @Email
        String email,
        @NotBlank(message = "Mot de passe requis")
        @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères")
        String password,
        @NotBlank(message = "Prénom requis")
        @Size(max = 100)
        String firstName,
        @NotBlank(message = "Nom requis")
        @Size(max = 100)
        String lastName,
        UUID companyId
) {}
