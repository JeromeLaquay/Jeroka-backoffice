package fr.jeroka.auth.jwks;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Endpoint standard pour la découverte des clés publiques (rotation via kid).
 */
@RestController
public class JwksController {

    private final JwksKeyService jwksKeyService;

    public JwksController(JwksKeyService jwksKeyService) {
        this.jwksKeyService = jwksKeyService;
    }

    @GetMapping(value = "/.well-known/jwks.json", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> jwks() {
        return ResponseEntity.ok(jwksKeyService.jwksJson());
    }

    @GetMapping("/.well-known/jwks")
    public ResponseEntity<Map<String, String>> jwksMeta() {
        return ResponseEntity.ok(Map.of("kid", jwksKeyService.currentKid()));
    }
}

