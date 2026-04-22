package fr.jeroka.docs.drive;

public record GoogleOAuthCredentials(
        String clientId,
        String clientSecret,
        String refreshToken,
        String redirectUri
) {
    public static GoogleOAuthCredentials of(String clientId, String clientSecret, String refreshToken, String redirectUri) {
        return new GoogleOAuthCredentials(
                value(clientId),
                value(clientSecret),
                value(refreshToken),
                value(redirectUri));
    }

    private static String value(String input) {
        return input != null ? input.trim() : "";
    }
}
