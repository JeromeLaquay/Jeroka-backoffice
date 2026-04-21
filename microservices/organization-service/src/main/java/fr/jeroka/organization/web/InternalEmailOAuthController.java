package fr.jeroka.organization.web;

import fr.jeroka.organization.service.OrgSocialCredentialsService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/internal/emails")
public class InternalEmailOAuthController {

    private final OrgSocialCredentialsService socialCredentialsService;
    private final String internalApiKey;

    public InternalEmailOAuthController(
            OrgSocialCredentialsService socialCredentialsService,
            @Value("${jeroka.internal.api-key:}") String internalApiKey) {
        this.socialCredentialsService = socialCredentialsService;
        this.internalApiKey = internalApiKey != null ? internalApiKey : "";
    }

    @GetMapping("/google-oauth/{userId}")
    public ResponseEntity<Map<String, String>> googleOAuthForUser(
            @PathVariable UUID userId,
            @RequestHeader(value = "X-Internal-Api-Key", required = false) String key) {
        if (!internalKeyValid(key)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return socialCredentialsService.googleCredentialsPayload(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    private boolean internalKeyValid(String key) {
        if (internalApiKey.isBlank()) {
            return false;
        }
        return internalApiKey.equals(key);
    }
}
