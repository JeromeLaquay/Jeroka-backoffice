package fr.jeroka.apijava.dto.admin;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

/**
 * Mise à jour utilisateur par l'admin (aligné frontend UpdateUserData). Tous les champs optionnels.
 */
public record UpdateAdminUserRequest(
        @Email @Size(max = 255) String email,
        @Size(max = 100) String first_name,
        @Size(max = 100) String last_name,
        @Size(max = 50) String role,
        Boolean is_active,
        String telephone
) {}
