package fr.jeroka.apijava.controller;

import fr.jeroka.apijava.dto.common.PageDto;
import fr.jeroka.apijava.api.ia.EmailDraftOptions;
import fr.jeroka.apijava.dto.message.*;
import fr.jeroka.apijava.exception.ApiException;
import fr.jeroka.apijava.mapping.MessageMappingService;
import fr.jeroka.apijava.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/messages")
public class MessageController {

    private final MessageMappingService messageMappingService;

    public MessageController(MessageMappingService messageMappingService) {
        this.messageMappingService = messageMappingService;
    }

    @GetMapping
    public PageDto<MessageResponse> list(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        var companyId = requireCompanyId(principal.companyId());
        return messageMappingService.listByCompany(companyId, page, limit);
    }

    @GetMapping("/stats")
    public MessageStatsResponse stats(
            @AuthenticationPrincipal JwtService.UserPrincipal principal) {
        return messageMappingService.getStats(requireCompanyId(principal.companyId()));
    }

    @GetMapping("/{id}")
    public MessageResponse getById(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @PathVariable UUID id) {
        return messageMappingService.getById(id, requireCompanyId(principal.companyId()));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MessageResponse create(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @Valid @RequestBody CreateMessageRequest request) {
        return messageMappingService.create(requireCompanyId(principal.companyId()), request);
    }

    @PutMapping("/{id}")
    public MessageResponse update(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateMessageRequest request) {
        return messageMappingService.update(id, requireCompanyId(principal.companyId()), request);
    }

    @PostMapping("/{id}/mark-read")
    public MessageResponse markRead(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @PathVariable UUID id) {
        return messageMappingService.markAsRead(id, requireCompanyId(principal.companyId()));
    }

    @PostMapping("/{id}/ai-draft")
    public MessageAiDraftResponse generateAiDraft(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @PathVariable UUID id,
            @RequestBody(required = false) java.util.Map<String, String> body) {
        var companyId = requireCompanyId(principal.companyId());
        var options = new EmailDraftOptions(
                body != null ? body.get("tone") : null,
                body != null ? body.get("language") : null);
        return messageMappingService.generateAiDraft(id, companyId, options);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @AuthenticationPrincipal JwtService.UserPrincipal principal,
            @PathVariable UUID id) {
        messageMappingService.delete(id, requireCompanyId(principal.companyId()));
    }

    private static UUID requireCompanyId(String companyId) {
        if (companyId == null || companyId.isBlank()) {
            throw new ApiException("Contexte entreprise manquant", HttpStatus.UNAUTHORIZED);
        }
        return UUID.fromString(companyId);
    }
}
