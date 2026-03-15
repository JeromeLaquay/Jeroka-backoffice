package fr.jeroka.apijava.dto.company;

/**
 * Mise à jour des infos entreprise (Paramètres > Entreprise).
 */
public record UpdateCompanyRequest(
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
        String description,
        String industry
) {}
