package fr.jeroka.docs.drive;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class OrganizationGoogleOAuthClient {

    private final RestClient http = RestClient.create();
    private final String organizationBaseUrl;
    private final String internalApiKey;

    public OrganizationGoogleOAuthClient(
            @Value("${jeroka.organization-api.base-url:http://organization-service:3005}") String organizationBaseUrl,
            @Value("${jeroka.internal.api-key:}") String internalApiKey) {
        this.organizationBaseUrl = trimTrailingSlashes(organizationBaseUrl);
        this.internalApiKey = internalApiKey != null ? internalApiKey.trim() : "";
    }

    public Optional<GoogleOAuthCredentials> getCredentials(UUID userId) {
        if (userId == null || internalApiKey.isBlank()) {
            return Optional.empty();
        }
        try {
            Map<String, Object> body = fetchBody(userId);
            return Optional.of(GoogleOAuthCredentials.of(
                    stringValue(body.get("clientId")),
                    stringValue(body.get("clientSecret")),
                    stringValue(body.get("refreshToken")),
                    stringValue(body.get("redirectUri"))));
        } catch (Exception ignored) {
            return Optional.empty();
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> fetchBody(UUID userId) {
        return http.get()
                .uri(organizationBaseUrl + "/api/v1/internal/emails/google-oauth/" + userId)
                .header("X-Internal-Api-Key", internalApiKey)
                .retrieve()
                .body(Map.class);
    }

    private static String stringValue(Object value) {
        return value != null ? value.toString() : "";
    }

    private static String trimTrailingSlashes(String value) {
        if (value == null) {
            return "";
        }
        String result = value.trim();
        while (result.endsWith("/")) {
            result = result.substring(0, result.length() - 1);
        }
        return result;
    }
}
