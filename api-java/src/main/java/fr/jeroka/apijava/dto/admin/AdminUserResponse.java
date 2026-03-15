package fr.jeroka.apijava.dto.admin;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Utilisateur pour l'admin (aligné frontend AdminUser).
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record AdminUserResponse(
        String id,
        String email,
        String first_name,
        String last_name,
        String role,
        boolean is_active,
        String created_at,
        String updated_at,
        String company_name
) {}
