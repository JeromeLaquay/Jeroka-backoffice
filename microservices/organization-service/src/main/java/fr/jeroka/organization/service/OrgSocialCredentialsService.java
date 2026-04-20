package fr.jeroka.organization.service;

import fr.jeroka.organization.entity.OrgCompanySocialCredentialEntity;
import fr.jeroka.organization.repository.OrgCompanySocialCredentialRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrgSocialCredentialsService {

    private final OrgCompanySocialCredentialRepository repository;

    public OrgSocialCredentialsService(OrgCompanySocialCredentialRepository repository) {
        this.repository = repository;
    }

    public Map<String, Object> credentialsPayload(UUID userId) {
        List<OrgCompanySocialCredentialEntity> rows = repository.findByUserIdAndActiveTrue(userId);
        List<Map<String, Object>> platforms = rows.stream().map(this::toPlatformRow).collect(Collectors.toList());
        return Map.of(
                "success", true,
                "data", Map.of("configuredPlatforms", platforms, "count", platforms.size()));
    }

    public boolean hasActiveGoogleCredentials(UUID userId) {
        return repository.existsByUserIdAndPlatformAndActiveTrue(userId, "google");
    }

    public Optional<Map<String, String>> googleCredentialsPayload(UUID userId) {
        return repository.findByUserIdAndPlatformAndActiveTrue(userId, "google")
                .flatMap(c -> mapGoogleCredentials(c.getEncryptedCredentials()));
    }

    private Map<String, Object> toPlatformRow(OrgCompanySocialCredentialEntity c) {
        return Map.of("platform", c.getPlatform(), "isConfigured", true, "hasValidCredentials", true);
    }

    private Optional<Map<String, String>> mapGoogleCredentials(Map<String, Object> creds) {
        if (creds == null) {
            return Optional.empty();
        }
        String clientId = readString(creds, "oauthClientId");
        String clientSecret = readString(creds, "oauthClientSecret");
        String refreshToken = readString(creds, "refreshToken");
        if (clientId.isBlank() || clientSecret.isBlank() || refreshToken.isBlank()) {
            return Optional.empty();
        }
        return Optional.of(Map.of(
                "clientId", clientId,
                "clientSecret", clientSecret,
                "refreshToken", refreshToken,
                "redirectUri", readString(creds, "redirectUri")));
    }

    private String readString(Map<String, Object> creds, String key) {
        Object value = creds.get(key);
        return value != null ? value.toString() : "";
    }
}
