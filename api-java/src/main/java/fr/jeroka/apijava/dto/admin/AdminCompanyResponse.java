package fr.jeroka.apijava.dto.admin;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Entreprise pour l'admin (aligné frontend AdminCompany).
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record AdminCompanyResponse(
        String id,
        String name,
        String email,
        String phone,
        String address_line1,
        String address_line2,
        String city,
        String postal_code,
        String country,
        String siret,
        String vat_number,
        Boolean is_active,
        String subscription_plan,
        String created_at,
        String updated_at,
        Long user_count
) {}
