package fr.jeroka.organization.web.dto.company;

public record OrgUpdateCompanyRequest(
        String name,
        String email,
        String phone,
        String address_line1,
        String address_line2,
        String city,
        String postal_code,
        String country,
        Object vat_number,
        String siret,
        String subscription_plan,
        Boolean is_active) {}
