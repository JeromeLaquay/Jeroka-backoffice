package fr.jeroka.apijava.controller;

import fr.jeroka.apijava.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * API REST pour les commandes (section Commandes du back-office).
 * Implémentation minimale : liste et stats vides tant qu'aucune entité Order n'existe.
 */
@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> list(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String period) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Non authentifié"));
        }
        Map<String, Object> data = Map.of(
                "orders", List.of(),
                "total", 0
        );
        return ResponseEntity.ok(Map.of("data", data));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> stats(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @RequestParam(required = false) String period) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Non authentifié"));
        }
        Map<String, Object> data = Map.of(
                "total", 0,
                "pending", 0,
                "delivered", 0,
                "revenue", 0
        );
        return ResponseEntity.ok(Map.of("data", data));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @RequestBody Map<String, Object> body) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Non authentifié"));
        }
        String id = UUID.randomUUID().toString();
        String orderNumber = "CMD-" + System.currentTimeMillis() % 100000;
        String now = java.time.Instant.now().toString();
        Map<String, Object> order = Map.of(
                "id", id,
                "orderNumber", orderNumber,
                "clientId", body.get("clientId") != null ? body.get("clientId").toString() : "",
                "status", body.get("status") != null ? body.get("status").toString() : "pending",
                "items", List.of(),
                "totalAmount", 0,
                "subtotalHt", 0,
                "taxAmount", 0,
                "createdAt", now,
                "updatedAt", now
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("data", order));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @PathVariable String id) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Non authentifié"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Commande non trouvée"));
    }
}
