package fr.jeroka.apijava.dto.admin;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Création utilisateur par l'admin (aligné frontend CreateUserData).
 * Champs en snake_case pour le JSON.
 */
public record CreateAdminUserRequest(
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8, message = "Le mot de passe doit contenir au moins 8 caractères") String password,
        @NotBlank @Size(max = 100) String first_name,
        @NotBlank @Size(max = 100) String last_name,
        @Size(max = 50) String role,
        @NotBlank(message = "Entreprise requise") String company_id,
        String telephone
) {}
