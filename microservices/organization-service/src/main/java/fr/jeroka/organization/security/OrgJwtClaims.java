package fr.jeroka.organization.security;

import fr.jeroka.organization.exception.OrgApiException;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.UUID;

/**
 * Lecture des claims JWT (companyId, sub).
 */
public final class OrgJwtClaims {

    private OrgJwtClaims() {}

    public static UUID requireCompanyId(Jwt jwt) {
        if (jwt == null) {
            throw new OrgApiException("Contexte entreprise manquant", HttpStatus.UNAUTHORIZED);
        }
        String raw = jwt.getClaimAsString("companyId");
        if (raw == null || raw.isBlank()) {
            throw new OrgApiException("Contexte entreprise manquant", HttpStatus.UNAUTHORIZED);
        }
        try {
            return UUID.fromString(raw.trim());
        } catch (IllegalArgumentException e) {
            throw new OrgApiException("Contexte entreprise invalide", HttpStatus.UNAUTHORIZED);
        }
    }

    public static UUID requireSubjectUserId(Jwt jwt) {
        if (jwt == null) {
            throw new OrgApiException("Utilisateur non authentifié", HttpStatus.UNAUTHORIZED);
        }
        String sub = jwt.getSubject();
        if (sub == null || sub.isBlank()) {
            throw new OrgApiException("Jeton invalide", HttpStatus.UNAUTHORIZED);
        }
        try {
            return UUID.fromString(sub.trim());
        } catch (IllegalArgumentException e) {
            throw new OrgApiException("Jeton invalide", HttpStatus.UNAUTHORIZED);
        }
    }
}
