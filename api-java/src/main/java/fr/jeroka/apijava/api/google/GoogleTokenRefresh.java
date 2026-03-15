package fr.jeroka.apijava.api.google;

import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * Rafraîchit un access token Google à partir des credentials (refresh_token, client_id, client_secret).
 */
public final class GoogleTokenRefresh {

    private static final String TOKEN_URL = "https://oauth2.googleapis.com/token";

    private GoogleTokenRefresh() {}

    public static String refreshAccessToken(GoogleOAuthCredentials credentials) {
        if (credentials == null || credentials.refreshToken() == null || credentials.refreshToken().isBlank())
            return credentials != null ? credentials.accessToken() : null;
        RestClient client = RestClient.builder().build();
        Map<?, ?> res = client.post()
                .uri(TOKEN_URL)
                .contentType(org.springframework.http.MediaType.APPLICATION_FORM_URLENCODED)
                .body("grant_type=refresh_token&client_id=" + encode(credentials.clientId())
                        + "&client_secret=" + encode(credentials.clientSecret())
                        + "&refresh_token=" + encode(credentials.refreshToken()))
                .retrieve()
                .body(Map.class);
        Object token = res != null ? res.get("access_token") : null;
        return token != null ? token.toString() : credentials.accessToken();
    }

    private static String encode(String s) {
        if (s == null) return "";
        return java.net.URLEncoder.encode(s, java.nio.charset.StandardCharsets.UTF_8);
    }
}
