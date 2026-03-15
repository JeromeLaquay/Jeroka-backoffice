package fr.jeroka.apijava.service;

import fr.jeroka.apijava.api.google.GoogleOAuthCredentials;
import fr.jeroka.apijava.entity.CompanySocialCredential;
import fr.jeroka.apijava.repository.CompanySocialCredentialsRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class GoogleOAuthSettingsService {

    private static final String AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
    private static final String TOKEN_URL = "https://oauth2.googleapis.com/token";
    private static final String SCOPES = "https://www.googleapis.com/auth/gmail.modify "
            + "https://www.googleapis.com/auth/calendar "
            + "https://www.googleapis.com/auth/drive";

    private final CompanySocialCredentialsRepository credentialsRepository;
    private final String clientId;
    private final String clientSecret;
    private final String redirectUri;
    private final String frontendUrl;

    public GoogleOAuthSettingsService(
            CompanySocialCredentialsRepository credentialsRepository,
            @Value("${app.google.oauth.client-id:}") String clientId,
            @Value("${app.google.oauth.client-secret:}") String clientSecret,
            @Value("${app.google.oauth.redirect-uri:}") String redirectUri,
            @Value("${app.frontend.url:http://localhost:5173}") String frontendUrl) {
        this.credentialsRepository = credentialsRepository;
        this.clientId = clientId != null ? clientId : "";
        this.clientSecret = clientSecret != null ? clientSecret : "";
        this.redirectUri = redirectUri != null ? redirectUri : "";
        this.frontendUrl = frontendUrl != null ? frontendUrl : "http://localhost:5173";
    }

    public String buildConnectUrl(UUID userId) {
        if (clientId.isBlank() || clientSecret.isBlank()) {
            throw new IllegalStateException("OAuth Client ID et Secret doivent être configurés");
        }
        String state = userId.toString();
        return AUTH_URL + "?response_type=code"
                + "&client_id=" + encode(clientId)
                + "&redirect_uri=" + encode(redirectUri)
                + "&scope=" + encode(SCOPES)
                + "&access_type=offline"
                + "&prompt=consent"
                + "&state=" + encode(state);
    }

    public void exchangeCodeAndSave(UUID userId, String code) {
        if (clientId.isBlank() || clientSecret.isBlank()) {
            throw new IllegalStateException("OAuth Client ID/Secret manquant");
        }
        String body = "grant_type=authorization_code"
                + "&code=" + encode(code)
                + "&client_id=" + encode(clientId)
                + "&client_secret=" + encode(clientSecret)
                + "&redirect_uri=" + encode(redirectUri);

        Map<?, ?> res = RestClient.create().post()
                .uri(TOKEN_URL)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(body)
                .retrieve()
                .body(Map.class);

        if (res == null) throw new IllegalStateException("Réponse token vide");
        Object refresh = res.get("refresh_token");
        if (refresh == null || refresh.toString().isBlank()) {
            throw new IllegalStateException("refresh_token absent");
        }

        Map<String, Object> creds = new HashMap<>();
        creds.put("oauthClientId", clientId);
        creds.put("oauthClientSecret", clientSecret);
        creds.put("refreshToken", refresh.toString());
        creds.put("accessToken", res.get("access_token"));
        creds.put("expiryDate", res.get("expires_in"));

        upsertGoogleCredentials(userId, creds);
    }

    private void upsertGoogleCredentials(UUID userId, Map<String, Object> creds) {
        credentialsRepository.findByUserIdAndPlatformAndIsActiveTrue(userId, "google")
                .ifPresentOrElse(
                        existing -> {
                            existing.setEncryptedCredentials(creds);
                            credentialsRepository.save(existing);
                        },
                        () -> {
                            var entity = new CompanySocialCredential();
                            entity.setUserId(userId);
                            entity.setPlatform("google");
                            entity.setEncryptedCredentials(creds);
                            entity.setIsActive(true);
                            credentialsRepository.save(entity);
                        }
                );
    }

    public String getFrontendUrl() {
        return frontendUrl;
    }

    public boolean isConnected(UUID userId) {
        try {
            return credentialsRepository.findByUserIdAndPlatformAndIsActiveTrue(userId, "google").isPresent();
        } catch (Exception e) {
            return false;
        }
    }

    /** Fournit les credentials OAuth Google pour un utilisateur (Drive, Gmail, Calendar). */
    public Optional<GoogleOAuthCredentials> getCredentialsForUser(UUID userId) {
        if (userId == null || clientId.isBlank() || clientSecret.isBlank()) {
            return Optional.empty();
        }
        return credentialsRepository.findByUserIdAndPlatformAndIsActiveTrue(userId, "google")
                .flatMap(c -> {
                    Map<String, Object> cred = c.getEncryptedCredentials();
                    if (cred == null) return Optional.empty();
                    String cid = cred.get("oauthClientId") != null ? cred.get("oauthClientId").toString() : null;
                    String secret = cred.get("oauthClientSecret") != null ? cred.get("oauthClientSecret").toString() : null;
                    Object rt = cred.get("refreshToken");
                    String refresh = rt != null ? rt.toString() : null;
                    if (cid == null || secret == null || refresh == null || refresh.isBlank()) return Optional.empty();
                    return Optional.of(GoogleOAuthCredentials.of(cid, secret, refresh, redirectUri));
                });
    }

    private static String encode(String s) {
        if (s == null) return "";
        return URLEncoder.encode(s, StandardCharsets.UTF_8);
    }
}
