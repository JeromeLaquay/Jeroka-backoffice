package fr.jeroka.docs.web;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Explorateur Drive sans appel Google (OAuth encore côté organization/core).
 * Liste vide : le front affiche le message « connexion Google ».
 */
@RestController
@RequestMapping("/api/v1/drive")
public class DriveApiController {

    @GetMapping("/list")
    public ResponseEntity<Map<String, Object>> list(
            @AuthenticationPrincipal Jwt jwt, @RequestParam(required = false) String parentId) {
        if (jwt == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Non authentifié"));
        }
        return ResponseEntity.ok(Map.of("data", List.of()));
    }

    @GetMapping("/list/{itemId}")
    public ResponseEntity<Map<String, Object>> getItem(
            @AuthenticationPrincipal Jwt jwt, @PathVariable String itemId) {
        if (jwt == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Non authentifié"));
        }
        return ResponseEntity.notFound().build();
    }
}
