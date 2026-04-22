package fr.jeroka.docs.web;

import fr.jeroka.docs.drive.GoogleDriveExplorerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/drive")
public class DriveApiController {

    private static final Logger log = LoggerFactory.getLogger(DriveApiController.class);
    private final GoogleDriveExplorerService driveExplorerService;

    public DriveApiController(GoogleDriveExplorerService driveExplorerService) {
        this.driveExplorerService = driveExplorerService;
    }

    @GetMapping("/list")
    public ResponseEntity<Map<String, Object>> list(
            @AuthenticationPrincipal Jwt jwt, @RequestParam(required = false) String parentId) {
        return execute(jwt, () -> Map.of("data", driveExplorerService.listChildren(userId(jwt), parentId)));
    }

    @GetMapping("/list/{itemId}")
    public ResponseEntity<Map<String, Object>> getItem(
            @AuthenticationPrincipal Jwt jwt, @PathVariable String itemId) {
        return execute(jwt, () -> driveExplorerService.getItem(userId(jwt), itemId));
    }

    private ResponseEntity<Map<String, Object>> execute(Jwt jwt, SupplierWithException<Map<String, Object>> action) {
        try {
            if (jwt == null) {
                return ResponseEntity.status(401).body(Map.of("message", "Non authentifié"));
            }
            return ResponseEntity.ok(action.get());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Erreur Drive API", e);
            return ResponseEntity.status(500).body(Map.of("message", "Erreur Google Drive"));
        }
    }

    private UUID userId(Jwt jwt) {
        String sub = jwt.getSubject();
        if (sub == null || sub.isBlank()) {
            throw new IllegalArgumentException("Jeton invalide");
        }
        try {
            return UUID.fromString(sub.trim());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Jeton invalide");
        }
    }

    @FunctionalInterface
    private interface SupplierWithException<T> {
        T get() throws Exception;
    }
}
