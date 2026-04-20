package fr.jeroka.content.security;

import fr.jeroka.content.exception.ContentApiException;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.UUID;

public final class ContentJwtCompanyId {

    private ContentJwtCompanyId() {}

    public static UUID require(Jwt jwt) {
        if (jwt == null) {
            throw new ContentApiException("Contexte entreprise manquant", HttpStatus.UNAUTHORIZED);
        }
        String raw = jwt.getClaimAsString("companyId");
        if (raw == null || raw.isBlank()) {
            throw new ContentApiException("Contexte entreprise manquant", HttpStatus.UNAUTHORIZED);
        }
        try {
            return UUID.fromString(raw.trim());
        } catch (IllegalArgumentException e) {
            throw new ContentApiException("Contexte entreprise invalide", HttpStatus.UNAUTHORIZED);
        }
    }
}
