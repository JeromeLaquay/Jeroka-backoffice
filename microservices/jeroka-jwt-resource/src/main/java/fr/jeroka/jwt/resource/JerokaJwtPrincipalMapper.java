package fr.jeroka.jwt.resource;

import org.springframework.security.oauth2.jwt.Jwt;

/**
 * Mappe un {@link Jwt} Spring vers {@link JerokaUserPrincipal}.
 */
public final class JerokaJwtPrincipalMapper {

    private JerokaJwtPrincipalMapper() {}

    public static JerokaUserPrincipal fromJwt(Jwt jwt) {
        return new JerokaUserPrincipal(
                jwt.getSubject(),
                jwt.getClaimAsString("email"),
                jwt.getClaimAsString("role"),
                jwt.getClaimAsString("companyId"));
    }
}
