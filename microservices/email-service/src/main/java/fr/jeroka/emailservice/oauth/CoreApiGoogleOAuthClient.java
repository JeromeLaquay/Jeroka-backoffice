package fr.jeroka.emailservice.oauth;

import fr.jeroka.emailservice.api.google.GoogleOAuthCredentials;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Récupère les credentials Google OAuth depuis organization-service.
 */
@Service
public class CoreApiGoogleOAuthClient {

    private final RestClient http = RestClient.create();
    private final String organizationBaseUrl;
    private final String internalApiKey;

    public CoreApiGoogleOAuthClient(
            @Value("${jeroka.organization-api.base-url:http://localhost:3005}") String organizationBaseUrl,
            @Value("${jeroka.internal.api-key:}") String internalApiKey) {
        this.organizationBaseUrl = trimTrailingSlashes(organizationBaseUrl);
        this.internalApiKey = internalApiKey != null ? internalApiKey : "";
    }

    public Optional<GoogleOAuthCredentials> getCredentialsForUser(UUID userId) {
        if (userId == null || internalApiKey.isBlank()) {
            return Optional.empty();
        }
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> body = http.get()
                    .uri(organizationBaseUrl + "/api/v1/internal/emails/google-oauth/" + userId)
                    .header("X-Internal-Api-Key", internalApiKey)
                    .retrieve()
                    .body(Map.class);
            if (body == null) {
                return Optional.empty();
            }
            return Optional.of(GoogleOAuthCredentials.of(
                    str(body.get("clientId")),
                    str(body.get("clientSecret")),
                    str(body.get("refreshToken")),
                    str(body.get("redirectUri"))));
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    private static String str(Object o) {
        return o != null ? o.toString() : "";
    }

    private static String trimTrailingSlashes(String url) {
        if (url == null) {
            return "";
        }
        String t = url.trim();
        while (t.endsWith("/")) {
            t = t.substring(0, t.length() - 1);
        }
        return t;
    }
}
