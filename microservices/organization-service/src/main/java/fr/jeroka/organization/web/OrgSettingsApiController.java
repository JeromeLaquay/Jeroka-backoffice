package fr.jeroka.organization.web;

import fr.jeroka.organization.security.OrgJwtClaims;
import fr.jeroka.organization.service.OrgSocialCredentialsService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/settings")
public class OrgSettingsApiController {

    private static final String CONNECT_UNAVAILABLE =
            "Connexion OAuth Google non migrée dans organization-service (utiliser le core en attendant).";

    private final OrgSocialCredentialsService socialCredentialsService;
    private final String frontendUrl;

    public OrgSettingsApiController(
            OrgSocialCredentialsService socialCredentialsService,
            @Value("${app.frontend-url:http://localhost:3001}") String frontendUrl) {
        this.socialCredentialsService = socialCredentialsService;
        this.frontendUrl = trimTrailingSlash(frontendUrl);
    }

    @GetMapping
    public Map<String, Object> getAll() {
        return Map.of("success", true, "data", Map.of());
    }

    @GetMapping("/ia-status")
    public Map<String, Object> iaStatus() {
        return Map.of("success", true, "data", Map.of("openaiConfigured", false, "provider", "Stub"));
    }

    @GetMapping("/google/connect")
    public ResponseEntity<Map<String, Object>> googleConnect() {
        return ResponseEntity.badRequest().body(Map.of("success", false, "message", CONNECT_UNAVAILABLE));
    }

    @GetMapping("/google/callback")
    public RedirectView googleCallback() {
        return new RedirectView(frontendUrl + "/parametres?google=error&reason=oauth_not_migrated");
    }

    @GetMapping("/google/status")
    public Map<String, Object> googleStatus(@AuthenticationPrincipal Jwt jwt) {
        boolean connected = socialCredentialsService.hasActiveGoogleCredentials(OrgJwtClaims.requireSubjectUserId(jwt));
        return Map.of(
                "success",
                true,
                "data",
                Map.of("isConnected", connected, "calendarId", null, "hasServiceAccount", false));
    }

    @PostMapping("/google/test/calendar")
    public ResponseEntity<Map<String, Object>> testCalendar(@AuthenticationPrincipal Jwt jwt) {
        return testGoogleConnection(jwt);
    }

    @PostMapping("/google/test/gmail")
    public ResponseEntity<Map<String, Object>> testGmail(@AuthenticationPrincipal Jwt jwt) {
        return testGoogleConnection(jwt);
    }

    @PostMapping("/google/test/drive")
    public ResponseEntity<Map<String, Object>> testDrive(@AuthenticationPrincipal Jwt jwt) {
        return testGoogleConnection(jwt);
    }

    private ResponseEntity<Map<String, Object>> testGoogleConnection(Jwt jwt) {
        boolean connected = socialCredentialsService.hasActiveGoogleCredentials(OrgJwtClaims.requireSubjectUserId(jwt));
        if (!connected) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Non configuré"));
        }
        return ResponseEntity.ok(Map.of("success", true));
    }

    private static String trimTrailingSlash(String value) {
        if (value == null || value.isBlank()) {
            return "http://localhost:3001";
        }
        String result = value.trim();
        while (result.endsWith("/")) {
            result = result.substring(0, result.length() - 1);
        }
        return result;
    }
}
