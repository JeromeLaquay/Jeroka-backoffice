package fr.jeroka.apijava.controller;

import fr.jeroka.apijava.api.google.DriveFileSummary;
import fr.jeroka.apijava.api.google.GoogleDriveService;
import fr.jeroka.apijava.security.JwtService;
import fr.jeroka.apijava.service.GoogleOAuthSettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * API REST pour la section Documents (Google Drive) du back-office.
 * GET /drive/list et GET /drive/list/:itemId.
 */
@RestController
@RequestMapping("/api/v1/drive")
public class DriveController {

    private static final int DEFAULT_PAGE_SIZE = 100;

    private final GoogleDriveService googleDriveService;
    private final GoogleOAuthSettingsService googleOAuthSettingsService;

    public DriveController(GoogleDriveService googleDriveService,
                           GoogleOAuthSettingsService googleOAuthSettingsService) {
        this.googleDriveService = googleDriveService;
        this.googleOAuthSettingsService = googleOAuthSettingsService;
    }

    @GetMapping("/list")
    public ResponseEntity<Map<String, Object>> list(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @RequestParam(required = false) String parentId) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Non authentifié"));
        }
        var credentials = googleOAuthSettingsService.getCredentialsForUser(UUID.fromString(principal.id()));
        if (credentials.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Connectez-vous à Google dans Paramètres (Mail/Drive/Calendar)."));
        }
        String folderId = (parentId != null && !parentId.isBlank()) ? parentId : "root";
        try {
            List<DriveFileSummary> items = googleDriveService.listDirectChildren(
                    credentials.get(), folderId, DEFAULT_PAGE_SIZE);
            List<Map<String, Object>> data = items.stream()
                    .map(DriveController::toItem)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(Map.of("data", data));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                    Map.of("message", "Erreur lors du chargement Drive: " + (e.getMessage() != null ? e.getMessage() : "Erreur interne")));
        }
    }

    @GetMapping("/list/{itemId}")
    public ResponseEntity<Map<String, Object>> getItem(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @PathVariable String itemId) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Non authentifié"));
        }
        var credentials = googleOAuthSettingsService.getCredentialsForUser(UUID.fromString(principal.id()));
        if (credentials.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Connectez-vous à Google dans Paramètres."));
        }
        DriveFileSummary item = googleDriveService.getFile(credentials.get(), itemId);
        if (item == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(Map.of("data", toItem(item)));
    }

    private static Map<String, Object> toItem(DriveFileSummary f) {
        return Map.of(
                "id", f != null && f.id() != null ? f.id() : "",
                "name", f != null && f.name() != null ? f.name() : "",
                "mimeType", f != null && f.mimeType() != null ? f.mimeType() : "",
                "type", f != null && f.type() != null ? f.type() : "file",
                "webViewLink", f != null && f.webViewLink() != null ? f.webViewLink() : ""
        );
    }
}
