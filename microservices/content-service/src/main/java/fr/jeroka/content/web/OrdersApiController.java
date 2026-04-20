package fr.jeroka.content.web;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/** Liste / stats vides + création stub (aligné core). */
@RestController
@RequestMapping("/api/v1/orders")
public class OrdersApiController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> list(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String period) {
        if (jwt == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Non authentifié"));
        }
        Map<String, Object> data = Map.of("orders", List.of(), "total", 0);
        return ResponseEntity.ok(Map.of("data", data));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> stats(
            @AuthenticationPrincipal Jwt jwt, @RequestParam(required = false) String period) {
        if (jwt == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Non authentifié"));
        }
        Map<String, Object> data = Map.of("total", 0, "pending", 0, "delivered", 0, "revenue", 0);
        return ResponseEntity.ok(Map.of("data", data));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(
            @AuthenticationPrincipal Jwt jwt, @RequestBody Map<String, Object> body) {
        if (jwt == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Non authentifié"));
        }
        String id = UUID.randomUUID().toString();
        String orderNumber = "CMD-" + System.currentTimeMillis() % 100000;
        String now = Instant.now().toString();
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
                "updatedAt", now);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("data", order));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(
            @AuthenticationPrincipal Jwt jwt, @PathVariable String id) {
        if (jwt == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Non authentifié"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Commande non trouvée"));
    }
}
