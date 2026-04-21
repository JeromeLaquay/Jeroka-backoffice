package fr.jeroka.billing.security;

import fr.jeroka.billing.exception.BillingApiException;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.UUID;

/** Extrait companyId du JWT (claim aligné sur auth-service). */
public final class BillingJwtCompanyId {

    private BillingJwtCompanyId() {}

    public static UUID require(Jwt jwt) {
        if (jwt == null) {
            throw new BillingApiException("Contexte entreprise manquant", HttpStatus.UNAUTHORIZED);
        }
        String raw = jwt.getClaimAsString("companyId");
        if (raw == null || raw.isBlank()) {
            throw new BillingApiException("Contexte entreprise manquant", HttpStatus.UNAUTHORIZED);
        }
        try {
            return UUID.fromString(raw.trim());
        } catch (IllegalArgumentException e) {
            throw new BillingApiException("Contexte entreprise invalide", HttpStatus.UNAUTHORIZED);
        }
    }
}
