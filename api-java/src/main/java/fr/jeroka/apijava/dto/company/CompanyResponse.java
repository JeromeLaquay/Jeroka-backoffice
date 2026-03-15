package fr.jeroka.apijava.dto.company;

/**
 * Réponse pour l'entreprise de l'utilisateur connecté (Paramètres > Entreprise).
 */
public record CompanyResponse(
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
