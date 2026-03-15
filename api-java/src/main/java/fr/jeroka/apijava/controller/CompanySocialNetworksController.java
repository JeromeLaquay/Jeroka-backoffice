package fr.jeroka.apijava.controller;

import fr.jeroka.apijava.repository.CompanySocialCredentialsRepository;
import fr.jeroka.apijava.security.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Endpoint aligné sur l'API Node : GET /company/social-networks/credentials
 * pour que le backoffice reçoive la liste des plateformes configurées.
 */
@RestController
@RequestMapping("/api/v1/company/social-networks")
public class CompanySocialNetworksController {

    private final CompanySocialCredentialsRepository credentialsRepository;

    public CompanySocialNetworksController(CompanySocialCredentialsRepository credentialsRepository) {
        this.credentialsRepository = credentialsRepository;
    }

    @GetMapping("/credentials")
    public ResponseEntity<Map<String, Object>> listConfigured(
            @AuthenticationPrincipal JwtService.UserPrincipal principal) {
        try {
            if (principal == null) {
                return okEmpty();
            }
            UUID userId = UUID.fromString(principal.id());
            var list = credentialsRepository.findByUserIdAndIsActiveTrue(userId);
            List<Map<String, Object>> platforms = list.stream()
                    .map(c -> Map.<String, Object>of(
                            "platform", c.getPlatform(),
                            "isConfigured", true,
                            "hasValidCredentials", true))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", Map.of(
                            "configuredPlatforms", platforms,
                            "count", platforms.size())));
        } catch (Exception e) {
            return okEmpty();
        }
    }

    private static ResponseEntity<Map<String, Object>> okEmpty() {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                        "configuredPlatforms", List.of(),
                        "count", 0)));
    }
}
