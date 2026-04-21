package fr.jeroka.auth.web.dto;

/**
 * Réponse login/register (même forme que l’ancien core pour le front).
 */
public record AuthResponseBody(
        String accessToken,
        String tokenType,
        UserInfo user
) {
    public static final String TOKEN_TYPE = "Bearer";

    public record UserInfo(
            String id,
            String email,
            String firstName,
            String lastName,
            String role,
            String companyId
    ) {}

    public static AuthResponseBody of(String accessToken, UserInfo user) {
        return new AuthResponseBody(accessToken, TOKEN_TYPE, user);
    }
}
