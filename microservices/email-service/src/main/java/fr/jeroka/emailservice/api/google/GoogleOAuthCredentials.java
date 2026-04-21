package fr.jeroka.emailservice.api.google;

/**
 * Credentials OAuth2 pour les APIs Google (Gmail, Drive, Calendar).
 * Ã‰quivalent des credentials utilisÃ©s dans api-dashboard.
 */
public record GoogleOAuthCredentials(
        String clientId,
        String clientSecret,
        String refreshToken,
        String accessToken,
        String redirectUri
) {
    public static GoogleOAuthCredentials of(String clientId, String clientSecret,
                                            String refreshToken, String redirectUri) {
        return new GoogleOAuthCredentials(clientId, clientSecret, refreshToken, null, redirectUri);
    }
}
