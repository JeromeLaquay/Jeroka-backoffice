package fr.jeroka.apijava.dto.admin;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * Création entreprise (aligné frontend CreateCompanyData).
 * vat_number accepte Number (front envoie 0) ou String.
 */
public record CreateCompanyRequest(
        @NotBlank String name,
        @NotBlank @Email String email,
        String phone,
        String address_line1,
        String address_line2,
        String city,
        String postal_code,
        String country,
        Object vat_number,
        String siret,
        String subscription_plan
) {}
