package fr.jeroka.catalog.security;

import fr.jeroka.catalog.exception.CatalogApiException;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.UUID;

/** Extrait companyId du JWT (claim aligné sur auth-service). */
public final class CatalogJwtCompanyId {

    private CatalogJwtCompanyId() {}

    public static UUID require(Jwt jwt) {
        if (jwt == null) {
            throw new CatalogApiException("Contexte entreprise manquant", HttpStatus.UNAUTHORIZED);
        }
        String raw = jwt.getClaimAsString("companyId");
        if (raw == null || raw.isBlank()) {
            throw new CatalogApiException("Contexte entreprise manquant", HttpStatus.UNAUTHORIZED);
        }
        try {
            return UUID.fromString(raw.trim());
        } catch (IllegalArgumentException e) {
            throw new CatalogApiException("Contexte entreprise invalide", HttpStatus.UNAUTHORIZED);
        }
    }
}
