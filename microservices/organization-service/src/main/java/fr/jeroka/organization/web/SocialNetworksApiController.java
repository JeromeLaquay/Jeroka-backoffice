package fr.jeroka.organization.web;

import fr.jeroka.organization.security.OrgJwtClaims;
import fr.jeroka.organization.service.OrgSocialCredentialsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Réseaux sociaux : liste des plateformes configurées (aligné sur le monolithe).
 * Les routes configure / deactivate / test ne sont pas portées depuis le core Java ; stubs explicites.
 */
@RestController
@RequestMapping("/api/v1/company/social-networks")
public class SocialNetworksApiController {

    private static final String STUB_MSG =
            "Non implémenté dans organization-service ; migration prévue (chiffrement / APIs réseaux).";

    private final OrgSocialCredentialsService socialCredentialsService;

    public SocialNetworksApiController(OrgSocialCredentialsService socialCredentialsService) {
        this.socialCredentialsService = socialCredentialsService;
    }

    @GetMapping("/credentials")
    public ResponseEntity<Map<String, Object>> listConfigured(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(
                socialCredentialsService.credentialsPayload(OrgJwtClaims.requireSubjectUserId(jwt)));
    }

    @PostMapping("/{platform}/configure")
    public ResponseEntity<Map<String, Object>> configureStub() {
        return notImplemented();
    }

    @DeleteMapping("/{platform}/deactivate")
    @SuppressWarnings("unused")
    public ResponseEntity<Map<String, Object>> deactivateStub(@PathVariable String platform) {
        return notImplemented();
    }

    @PostMapping("/{platform}/test")
    @SuppressWarnings("unused")
    public ResponseEntity<Map<String, Object>> testStub(@PathVariable String platform) {
        return notImplemented();
    }

    private static ResponseEntity<Map<String, Object>> notImplemented() {
        return ResponseEntity.ok(Map.of("success", false, "message", STUB_MSG));
    }
}
