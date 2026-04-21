package fr.jeroka.organization.web.dto.company;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record OrgCreateCompanyRequest(
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
        String subscription_plan) {}
