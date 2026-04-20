package fr.jeroka.dashboard.security;

import fr.jeroka.dashboard.exception.DashboardApiException;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.UUID;

public final class DashboardJwtCompanyId {

    private DashboardJwtCompanyId() {}

    public static UUID require(Jwt jwt) {
        if (jwt == null) {
            throw new DashboardApiException("Contexte entreprise manquant", HttpStatus.UNAUTHORIZED);
        }
        String raw = jwt.getClaimAsString("companyId");
        if (raw == null || raw.isBlank()) {
            throw new DashboardApiException("Contexte entreprise manquant", HttpStatus.UNAUTHORIZED);
        }
        try {
            return UUID.fromString(raw.trim());
        } catch (IllegalArgumentException e) {
            throw new DashboardApiException("Contexte entreprise invalide", HttpStatus.UNAUTHORIZED);
        }
    }
}
