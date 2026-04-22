package fr.jeroka.docs.drive;

import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

public final class GoogleTokenRefresh {

    private static final String TOKEN_URL = "https://oauth2.googleapis.com/token";

    private GoogleTokenRefresh() {}

    public static String refreshAccessToken(GoogleOAuthCredentials credentials) {
        if (credentials == null || credentials.refreshToken().isBlank()) {
            return "";
        }
        RestClient client = RestClient.builder().build();
        Map<?, ?> body = client.post()
                .uri(TOKEN_URL)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(formBody(credentials))
                .retrieve()
                .body(Map.class);
        Object token = body != null ? body.get("access_token") : null;
        return token != null ? token.toString() : "";
    }

    private static String formBody(GoogleOAuthCredentials credentials) {
        return "grant_type=refresh_token"
                + "&client_id=" + encode(credentials.clientId())
                + "&client_secret=" + encode(credentials.clientSecret())
                + "&refresh_token=" + encode(credentials.refreshToken());
    }

    private static String encode(String input) {
        return URLEncoder.encode(input != null ? input : "", StandardCharsets.UTF_8);
    }
}
