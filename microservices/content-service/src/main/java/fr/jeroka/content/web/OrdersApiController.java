package fr.jeroka.content.web;

import fr.jeroka.content.exception.ContentApiException;
import fr.jeroka.content.security.ContentJwtCompanyId;
import fr.jeroka.content.service.ContentOrderService;
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

import java.util.Map;
import java.util.UUID;

/** API commandes persistées pour le backoffice. */
@RestController
@RequestMapping("/api/v1/orders")
public class OrdersApiController {

    private final ContentOrderService service;

    public OrdersApiController(ContentOrderService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> list(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String period) {
        UUID companyId = ContentJwtCompanyId.require(jwt);
        return ResponseEntity.ok(Map.of("data", service.list(companyId, page, limit, search, status, period)));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> stats(
            @AuthenticationPrincipal Jwt jwt, @RequestParam(required = false) String period) {
        UUID companyId = ContentJwtCompanyId.require(jwt);
        return ResponseEntity.ok(Map.of("data", service.stats(companyId, period)));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> create(
            @AuthenticationPrincipal Jwt jwt, @RequestBody Map<String, Object> body) {
        UUID companyId = ContentJwtCompanyId.require(jwt);
        return ResponseEntity.status(201).body(Map.of("data", service.create(companyId, body)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(
            @AuthenticationPrincipal Jwt jwt, @PathVariable String id) {
        UUID companyId = ContentJwtCompanyId.require(jwt);
        return ResponseEntity.ok(Map.of("data", service.getById(companyId, parseUuid(id))));
    }

    private UUID parseUuid(String value) {
        try {
            return UUID.fromString(value);
        } catch (Exception ex) {
            throw new ContentApiException("Identifiant de commande invalide", HttpStatus.BAD_REQUEST);
        }
    }
}
