package fr.jeroka.emailservice.controller;

import fr.jeroka.emailservice.security.JwtService;
import fr.jeroka.emailservice.service.EmailsModuleService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/emails")
public class EmailsController {

    private final EmailsModuleService emailsModuleService;
    private final String internalApiKey;

    public EmailsController(
            EmailsModuleService emailsModuleService,
            @Value("${jeroka.internal.api-key:}") String internalApiKey) {
        this.emailsModuleService = emailsModuleService;
        this.internalApiKey = internalApiKey != null ? internalApiKey : "";
    }

    @GetMapping("/categories")
    public ResponseEntity<Map<String, Object>> categories(
            @AuthenticationPrincipal JwtService.UserPrincipal principal) {
        var data = emailsModuleService.listCategories(principal);
        return ResponseEntity.ok(Map.of("success", true, "data", data));
    }

    @PostMapping("/categories")
    public ResponseEntity<Map<String, Object>> createCategory(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @RequestBody EmailsModuleService.CreateCategoryRequest body) {
        var data = emailsModuleService.createCategory(principal, body);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("success", true, "data", data));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<Map<String, Object>> updateCategory(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @PathVariable String id,
            @RequestBody EmailsModuleService.UpdateCategoryRequest body) {
        var data = emailsModuleService.updateCategory(principal, id, body);
        return ResponseEntity.ok(Map.of("success", true, "data", data));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Map<String, Object>> deleteCategory(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @PathVariable String id) {
        emailsModuleService.deleteCategory(principal, id);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/senders")
    public ResponseEntity<Map<String, Object>> senders(
            @AuthenticationPrincipal JwtService.UserPrincipal principal) {
        var data = emailsModuleService.listSenders(principal);
        return ResponseEntity.ok(Map.of("success", true, "data", data));
    }

    @PutMapping("/senders/{senderId}/category")
    public ResponseEntity<Map<String, Object>> assignSenderToCategory(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @PathVariable String senderId,
            @RequestBody EmailsModuleService.AssignCategoryRequest body) {
        emailsModuleService.assignSenderToCategory(principal, senderId, body);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> emails(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer limit,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) Boolean hasAttachments) {
        var query = EmailsModuleService.EmailsQuery.of(page, limit, categoryId, hasAttachments);
        var payload = emailsModuleService.listEmails(principal, query);
        return ResponseEntity.ok(Map.of("success", true, "data", payload));
    }

    @PostMapping("/sync")
    public ResponseEntity<Map<String, Object>> sync(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @RequestBody(required = false) EmailsModuleService.SyncRequest body) {
        var job = emailsModuleService.requestSync(principal, body);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(Map.of("success", true, "data", job));
    }

    @GetMapping("/sync/{jobId}")
    public ResponseEntity<Map<String, Object>> getSyncJob(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @PathVariable String jobId) {
        var data = emailsModuleService.getSyncJob(principal, jobId);
        return ResponseEntity.ok(Map.of("success", true, "data", data));
    }

    @PostMapping("/sync/{jobId}/run")
    public ResponseEntity<Map<String, Object>> runSyncJob(
            @RequestHeader(name = "X-Internal-Api-Key", required = false) String key,
            @PathVariable String jobId) {
        if (internalApiKey.isBlank() || key == null || !internalApiKey.equals(key)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("success", false, "error", "Forbidden"));
        }
        var data = emailsModuleService.runSyncJob(UUID.fromString(jobId));
        return ResponseEntity.ok(Map.of("success", true, "data", data));
    }
}
