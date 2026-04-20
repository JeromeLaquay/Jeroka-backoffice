package fr.jeroka.crm.web;

import fr.jeroka.crm.security.CrmJwtCompanyId;
import fr.jeroka.crm.service.CrmMessageAiService;
import fr.jeroka.crm.service.CrmMessageService;
import fr.jeroka.crm.web.dto.CreateMessageRequestDto;
import fr.jeroka.crm.web.dto.MessageAiDraftResponseDto;
import fr.jeroka.crm.web.dto.MessageResponseDto;
import fr.jeroka.crm.web.dto.MessageStatsResponseDto;
import fr.jeroka.crm.web.dto.PageDto;
import fr.jeroka.crm.web.dto.UpdateMessageRequestDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/messages")
public class MessagesApiController {

    private final CrmMessageService crmMessageService;
    private final CrmMessageAiService crmMessageAiService;

    public MessagesApiController(CrmMessageService crmMessageService, CrmMessageAiService crmMessageAiService) {
        this.crmMessageService = crmMessageService;
        this.crmMessageAiService = crmMessageAiService;
    }

    @GetMapping
    public PageDto<MessageResponseDto> list(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        return crmMessageService.list(CrmJwtCompanyId.require(jwt), page, limit);
    }

    @GetMapping("/stats")
    public MessageStatsResponseDto stats(@AuthenticationPrincipal Jwt jwt) {
        return crmMessageService.stats(CrmJwtCompanyId.require(jwt));
    }

    @GetMapping("/{id}")
    public MessageResponseDto getById(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        return crmMessageService.getById(id, CrmJwtCompanyId.require(jwt));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MessageResponseDto create(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CreateMessageRequestDto body) {
        return crmMessageService.create(CrmJwtCompanyId.require(jwt), body);
    }

    @PutMapping("/{id}")
    public MessageResponseDto update(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateMessageRequestDto body) {
        return crmMessageService.update(id, CrmJwtCompanyId.require(jwt), body);
    }

    @PostMapping("/{id}/mark-read")
    public MessageResponseDto markRead(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        return crmMessageService.markAsRead(id, CrmJwtCompanyId.require(jwt));
    }

    @PostMapping("/{id}/ai-draft")
    public MessageAiDraftResponseDto aiDraft(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body) {
        var msg = crmMessageService.loadForAi(id, CrmJwtCompanyId.require(jwt));
        return crmMessageAiService.draft(msg, body);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        crmMessageService.delete(id, CrmJwtCompanyId.require(jwt));
    }
}
