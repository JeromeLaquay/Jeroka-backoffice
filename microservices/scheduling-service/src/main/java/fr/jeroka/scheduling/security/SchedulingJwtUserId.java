package fr.jeroka.scheduling.security;

import fr.jeroka.scheduling.exception.SchedulingApiException;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.UUID;

/** Sujet JWT = identifiant utilisateur (aligné auth-service). */
public final class SchedulingJwtUserId {

    private SchedulingJwtUserId() {}

    public static UUID require(Jwt jwt) {
        if (jwt == null) {
            throw new SchedulingApiException("Utilisateur non authentifié", HttpStatus.UNAUTHORIZED);
        }
        String sub = jwt.getSubject();
        if (sub == null || sub.isBlank()) {
            throw new SchedulingApiException("Utilisateur non authentifié", HttpStatus.UNAUTHORIZED);
        }
        try {
            return UUID.fromString(sub.trim());
        } catch (IllegalArgumentException e) {
            throw new SchedulingApiException("Identifiant utilisateur invalide", HttpStatus.UNAUTHORIZED);
        }
    }
}
