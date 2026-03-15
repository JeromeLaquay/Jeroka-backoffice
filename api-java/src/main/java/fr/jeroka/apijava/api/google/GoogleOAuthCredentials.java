package fr.jeroka.apijava.api.google;

/**
 * Credentials OAuth2 pour les APIs Google (Gmail, Drive, Calendar).
 * Équivalent des credentials utilisés dans api-dashboard.
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
