package fr.jeroka.crm.security;

import fr.jeroka.crm.exception.CrmApiException;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.UUID;

/**
 * Extrait companyId du JWT (claim aligné sur auth-service).
 */
public final class CrmJwtCompanyId {

    private CrmJwtCompanyId() {}

    public static UUID require(Jwt jwt) {
        if (jwt == null) {
            throw new CrmApiException("Contexte entreprise manquant", HttpStatus.UNAUTHORIZED);
        }
        String raw = jwt.getClaimAsString("companyId");
        if (raw == null || raw.isBlank()) {
            throw new CrmApiException("Contexte entreprise manquant", HttpStatus.UNAUTHORIZED);
        }
        try {
            return UUID.fromString(raw.trim());
        } catch (IllegalArgumentException e) {
            throw new CrmApiException("Contexte entreprise invalide", HttpStatus.UNAUTHORIZED);
        }
    }
}
