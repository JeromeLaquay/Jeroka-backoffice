package fr.jeroka.organization.web.dto;

/**
 * Réponse GET/PUT entreprise (alignée sur l’ancien core).
 */
public record CompanyResponseDto(
        String id,
        String name,
        String legalName,
        String siret,
        String vatNumber,
        String addressLine1,
        String addressLine2,
        String city,
        String postalCode,
        String country,
        String phone,
        String email,
        String website,
        String logoUrl,
        String description,
        String industry
) {}
