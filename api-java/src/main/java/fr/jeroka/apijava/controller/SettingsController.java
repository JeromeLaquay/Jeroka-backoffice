package fr.jeroka.apijava.controller;

import fr.jeroka.apijava.api.ia.ChatgptService;
import fr.jeroka.apijava.security.JwtService;
import fr.jeroka.apijava.service.GoogleOAuthSettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/settings")
public class SettingsController {

    private final GoogleOAuthSettingsService googleOAuthSettingsService;
    private final ChatgptService chatgptService;

    public SettingsController(GoogleOAuthSettingsService googleOAuthSettingsService,
                              ChatgptService chatgptService) {
        this.googleOAuthSettingsService = googleOAuthSettingsService;
        this.chatgptService = chatgptService;
    }

    /**
     * Indique si l'IA utilise l'API OpenAI réelle ou le stub (clé non configurée).
     */
    @GetMapping("/ia-status")
    public ResponseEntity<Map<String, Object>> iaStatus(
            @AuthenticationPrincipal JwtService.UserPrincipal principal) {
        boolean openaiConfigured = !chatgptService.getClass().getSimpleName().contains("Stub");
        Map<String, Object> data = Map.of(
                "openaiConfigured", openaiConfigured,
                "provider", chatgptService.getClass().getSimpleName()
        );
        return ResponseEntity.ok(Map.of("success", true, "data", data));
    }

    @GetMapping("/google/connect")
    public ResponseEntity<Map<String, Object>> googleConnect(
            @AuthenticationPrincipal JwtService.UserPrincipal principal) {
        try {
            UUID userId = UUID.fromString(principal.id());
            String redirectUrl = googleOAuthSettingsService.buildConnectUrl(userId);
            return ResponseEntity.ok(Map.of("success", true, "redirectUrl", redirectUrl));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/google/callback")
    public org.springframework.web.servlet.view.RedirectView googleCallback(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String state) {
        if (code == null || code.isBlank() || state == null || state.isBlank()) {
            String front = googleOAuthSettingsService.getFrontendUrl();
            return new org.springframework.web.servlet.view.RedirectView(
                    front + "/parametres?google=error&reason=code_or_state_missing");
        }
        try {
            UUID userId = UUID.fromString(state);
            googleOAuthSettingsService.exchangeCodeAndSave(userId, code);
            String front = googleOAuthSettingsService.getFrontendUrl();
            return new org.springframework.web.servlet.view.RedirectView(front + "/parametres?google=connected");
        } catch (Exception e) {
            String front = googleOAuthSettingsService.getFrontendUrl();
            String reason = URLEncoder.encode(e.getMessage(), StandardCharsets.UTF_8);
            return new org.springframework.web.servlet.view.RedirectView(front + "/parametres?google=error&reason=" + reason);
        }
    }

    @GetMapping("/google/status")
    public ResponseEntity<Map<String, Object>> googleStatus(
            @AuthenticationPrincipal JwtService.UserPrincipal principal) {
        Map<String, Object> data = new HashMap<>();
        data.put("calendarId", null);
        data.put("hasServiceAccount", false);
        try {
            if (principal == null) {
                data.put("isConnected", false);
                return ResponseEntity.ok(Map.of("success", true, "data", data));
            }
            UUID userId = UUID.fromString(principal.id());
            boolean isConnected = googleOAuthSettingsService.isConnected(userId);
            data.put("isConnected", isConnected);
            return ResponseEntity.ok(Map.of("success", true, "data", data));
        } catch (Exception e) {
            data.put("isConnected", false);
            return ResponseEntity.ok(Map.of("success", true, "data", data));
        }
    }

    @PostMapping("/google/test/calendar")
    public ResponseEntity<Map<String, Object>> testCalendar(
            @AuthenticationPrincipal JwtService.UserPrincipal principal) {
        return testGoogleConnection(principal);
    }

    @PostMapping("/google/test/gmail")
    public ResponseEntity<Map<String, Object>> testGmail(
            @AuthenticationPrincipal JwtService.UserPrincipal principal) {
        return testGoogleConnection(principal);
    }

    @PostMapping("/google/test/drive")
    public ResponseEntity<Map<String, Object>> testDrive(
            @AuthenticationPrincipal JwtService.UserPrincipal principal) {
        return testGoogleConnection(principal);
    }

    private ResponseEntity<Map<String, Object>> testGoogleConnection(JwtService.UserPrincipal principal) {
        UUID userId = UUID.fromString(principal.id());
        boolean connected = googleOAuthSettingsService.isConnected(userId);
        if (!connected) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Non configuré"));
        }
        return ResponseEntity.ok(Map.of("success", true));
    }
}
