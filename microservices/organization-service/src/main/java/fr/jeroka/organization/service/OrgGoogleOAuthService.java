package fr.jeroka.organization.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import fr.jeroka.organization.entity.OrgCompanySocialCredentialEntity;
import fr.jeroka.organization.entity.OrgOauthGoogleStateEntity;
import fr.jeroka.organization.exception.OrgApiException;
import fr.jeroka.organization.repository.OrgCompanySocialCredentialRepository;
import fr.jeroka.organization.repository.OrgOauthGoogleStateRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * OAuth2 Google (authorization code) : URL de consentement + callback + persistance JSON credentials.
 */
@Service
public class OrgGoogleOAuthService {

    private static final Duration STATE_TTL = Duration.ofMinutes(15);
    private static final String GOOGLE_AUTH = "https://accounts.google.com/o/oauth2/v2/auth";
    private static final String GOOGLE_TOKEN = "https://oauth2.googleapis.com/token";
    private static final String SCOPE =
            "openid https://www.googleapis.com/auth/userinfo.email "
                    + "https://www.googleapis.com/auth/gmail.modify "
                    + "https://www.googleapis.com/auth/calendar "
                    + "https://www.googleapis.com/auth/drive";

    private final OrgOauthGoogleStateRepository stateRepository;
    private final OrgCompanySocialCredentialRepository credentialRepository;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final String clientId;
    private final String clientSecret;
    private final String redirectUri;
    private final String frontendUrl;

    public OrgGoogleOAuthService(
            OrgOauthGoogleStateRepository stateRepository,
            OrgCompanySocialCredentialRepository credentialRepository,
            ObjectMapper objectMapper,
            @Value("${jeroka.google.oauth.client-id:}") String clientId,
            @Value("${jeroka.google.oauth.client-secret:}") String clientSecret,
            @Value("${jeroka.google.oauth.redirect-uri:http://localhost:3000/api/v1/settings/google/callback}")
                    String redirectUri,
            @Value("${app.frontend-url:http://localhost:3001}") String frontendUrl) {
        this.stateRepository = stateRepository;
        this.credentialRepository = credentialRepository;
        this.objectMapper = objectMapper;
        this.clientId = clientId != null ? clientId.trim() : "";
        this.clientSecret = clientSecret != null ? clientSecret.trim() : "";
        this.redirectUri = redirectUri != null ? redirectUri.trim() : "";
        this.frontendUrl = trimFrontend(frontendUrl);
    }

    @Transactional
    public Map<String, Object> startAuthorization(UUID userId, UUID companyId) {
        requireOAuthConfigured();
        purgeExpiredStates();
        String state = UUID.randomUUID().toString().replace("-", "");
        persistState(state, userId, companyId);
        return Map.of("success", true, "data", Map.of("redirectUrl", buildAuthorizeUrl(state)));
    }

    @Transactional
    public String completeOAuthRedirect(String code, String state, String error, String errorDescription) {
        if (error != null && !error.isBlank()) {
            return frontendError(error, errorDescription);
        }
        if (code == null || state == null || code.isBlank() || state.isBlank()) {
            return frontendError("missing_code", "Paramètres OAuth manquants");
        }
        Instant minCreated = Instant.now().minus(STATE_TTL);
        OrgOauthGoogleStateEntity row = stateRepository
                .findById(state)
                .filter(r -> r.getCreatedAt().isAfter(minCreated))
                .orElseThrow(() -> new OrgApiException("Session OAuth invalide ou expirée", HttpStatus.BAD_REQUEST));
        UUID userId = row.getUserId();
        UUID companyId = row.getCompanyId();
        stateRepository.deleteById(state);
        String refresh = exchangeForRefreshToken(code);
        upsertGoogleCredentials(userId, companyId, refresh);
        return frontendUrl + "/parametres?google=connected";
    }

    private void requireOAuthConfigured() {
        if (clientId.isBlank() || clientSecret.isBlank() || redirectUri.isBlank()) {
            throw new OrgApiException(
                    "Google OAuth non configuré (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, redirect URI).",
                    HttpStatus.BAD_REQUEST);
        }
    }

    private void purgeExpiredStates() {
        stateRepository.deleteByCreatedAtBefore(Instant.now().minus(STATE_TTL));
    }

    private void persistState(String state, UUID userId, UUID companyId) {
        OrgOauthGoogleStateEntity e = new OrgOauthGoogleStateEntity();
        e.setState(state);
        e.setUserId(userId);
        e.setCompanyId(companyId);
        e.setCreatedAt(Instant.now());
        stateRepository.save(e);
    }

    private String buildAuthorizeUrl(String state) {
        Charset enc = StandardCharsets.UTF_8;
        return GOOGLE_AUTH
                + "?client_id="
                + URLEncoder.encode(clientId, enc)
                + "&redirect_uri="
                + URLEncoder.encode(redirectUri, enc)
                + "&response_type=code&scope="
                + URLEncoder.encode(SCOPE, enc)
                + "&access_type=offline&prompt=consent&state="
                + URLEncoder.encode(state, enc);
    }

    private String exchangeForRefreshToken(String code) {
        String form = tokenRequestBody(code);
        HttpRequest req = HttpRequest.newBuilder(URI.create(GOOGLE_TOKEN))
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(form))
                .timeout(Duration.ofSeconds(25))
                .build();
        try {
            HttpResponse<String> res = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
            if (res.statusCode() != 200) {
                throw new OrgApiException("Échec échange token Google (HTTP " + res.statusCode() + ")", HttpStatus.BAD_GATEWAY);
            }
            return parseRefreshToken(res.body());
        } catch (IOException e) {
            throw new OrgApiException("Erreur réseau vers Google", HttpStatus.BAD_GATEWAY);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new OrgApiException("Appel Google interrompu", HttpStatus.BAD_GATEWAY);
        }
    }

    private String tokenRequestBody(String code) {
        Charset enc = StandardCharsets.UTF_8;
        return "grant_type=authorization_code"
                + "&code=" + URLEncoder.encode(code, enc)
                + "&client_id=" + URLEncoder.encode(clientId, enc)
                + "&client_secret=" + URLEncoder.encode(clientSecret, enc)
                + "&redirect_uri=" + URLEncoder.encode(redirectUri, enc);
    }

    private String parseRefreshToken(String jsonBody) {
        try {
            JsonNode root = objectMapper.readTree(jsonBody);
            String refresh = root.path("refresh_token").asText("");
            if (refresh.isBlank()) {
                throw new OrgApiException(
                        "Google n'a pas renvoyé de refresh_token (révoquer l'accès ou réessayer avec prompt=consent).",
                        HttpStatus.BAD_REQUEST);
            }
            return refresh;
        } catch (IOException e) {
            throw new OrgApiException("Réponse token Google illisible", HttpStatus.BAD_GATEWAY);
        }
    }

    private void upsertGoogleCredentials(UUID userId, UUID companyId, String refreshToken) {
        Instant now = Instant.now();
        Map<String, Object> creds = new HashMap<>();
        creds.put("oauthClientId", clientId);
        creds.put("oauthClientSecret", clientSecret);
        creds.put("refreshToken", refreshToken);
        creds.put("redirectUri", redirectUri);
        Optional<OrgCompanySocialCredentialEntity> existing =
                credentialRepository.findByUserIdAndPlatformAndActiveTrue(userId, "google");
        if (existing.isPresent()) {
            OrgCompanySocialCredentialEntity e = existing.get();
            e.setEncryptedCredentials(creds);
            e.setUpdatedAt(now);
            credentialRepository.save(e);
            return;
        }
        OrgCompanySocialCredentialEntity n = new OrgCompanySocialCredentialEntity();
        n.setId(UUID.randomUUID());
        n.setUserId(userId);
        n.setCompanyId(companyId);
        n.setPlatform("google");
        n.setEncryptedCredentials(creds);
        n.setActive(true);
        n.setExpiresAt(null);
        n.setLastUsedAt(null);
        n.setCreatedAt(now);
        n.setUpdatedAt(now);
        credentialRepository.save(n);
    }

    private String frontendError(String code, String description) {
        String msg = description != null && !description.isBlank() ? code + ": " + description : code;
        return frontendUrl + "/parametres?google=error&reason=" + URLEncoder.encode(msg, StandardCharsets.UTF_8);
    }

    private static String trimFrontend(String raw) {
        if (raw == null || raw.isBlank()) {
            return "http://localhost:3001";
        }
        String s = raw.trim();
        while (s.endsWith("/")) {
            s = s.substring(0, s.length() - 1);
        }
        return s;
    }
}
