package fr.jeroka.apijava.mapping;

import fr.jeroka.apijava.api.ia.EmailDraftOptions;
import fr.jeroka.apijava.api.ia.IaService;
import fr.jeroka.apijava.dto.common.PageDto;
import fr.jeroka.apijava.dto.message.*;
import fr.jeroka.apijava.entity.Message;
import fr.jeroka.apijava.service.MessageService;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class MessageMappingService {

    private final MessageService messageService;
    private final IaService iaService;

    public MessageMappingService(MessageService messageService, IaService iaService) {
        this.messageService = messageService;
        this.iaService = iaService;
    }

    public PageDto<MessageResponse> listByCompany(UUID companyId, int page, int limit) {
        var p = messageService.findByCompanyId(companyId, page, limit);
        var items = p.getContent().stream().map(this::toResponse).toList();
        return PageDto.of(items, page, limit, p.getTotalElements());
    }

    public MessageResponse getById(UUID id, UUID companyId) {
        return toResponse(messageService.getByIdAndCompanyId(id, companyId));
    }

    public MessageResponse create(UUID companyId, CreateMessageRequest request) {
        var message = toEntity(companyId, request);
        return toResponse(messageService.create(message));
    }

    public MessageResponse update(UUID id, UUID companyId, UpdateMessageRequest request) {
        var message = messageService.getByIdAndCompanyId(id, companyId);
        applyUpdate(message, request);
        return toResponse(messageService.update(message));
    }

    public void delete(UUID id, UUID companyId) {
        messageService.delete(id, companyId);
    }

    public MessageResponse markAsRead(UUID id, UUID companyId) {
        return toResponse(messageService.markAsRead(id, companyId));
    }

    /**
     * Génère un brouillon de réponse par IA pour un message de contact.
     */
    public MessageAiDraftResponse generateAiDraft(UUID id, UUID companyId, EmailDraftOptions options) {
        Message m = messageService.getByIdAndCompanyId(id, companyId);
        String prompt = buildDraftPrompt(m, options);
        String draft = iaService.callOpenAI(prompt);
        return new MessageAiDraftResponse(draft != null ? draft.trim() : "");
    }

    private static String buildDraftPrompt(Message m, EmailDraftOptions options) {
        String tone = options != null && options.tone() != null && !options.tone().isBlank() ? options.tone() : "professionnel";
        String language = options != null && options.language() != null ? options.language() : "fr";
        String langLabel = "fr".equalsIgnoreCase(language) ? "français" : "english";
        return """
            Tu rédiges une réponse courtoise à un message de contact reçu sur un site professionnel.
            Ton demandé : %s. Langue de la réponse : %s.
            Message reçu :
            - De : %s %s (%s)
            - Sujet : %s
            - Contenu : %s
            Réponds uniquement par le corps du message (pas d'objet, pas de formules d'en-tête type "Bonjour," si déjà dans le corps). Texte court et adapté.
            """.formatted(
                tone,
                langLabel,
                m.getFirstName(), m.getLastName(), m.getEmail(),
                m.getSubject(),
                m.getMessage()
            );
    }

    public MessageStatsResponse getStats(UUID companyId) {
        var total = messageService.countByCompanyId(companyId);
        var newCount = messageService.countByCompanyIdAndStatus(companyId, "new");
        var readCount = messageService.countByCompanyIdAndStatus(companyId, "read");
        var repliedCount = messageService.countByCompanyIdAndStatus(companyId, "replied");
        var archivedCount = messageService.countByCompanyIdAndStatus(companyId, "archived");
        var now = java.time.Instant.now();
        var startOfDay = now.truncatedTo(java.time.temporal.ChronoUnit.DAYS);
        var weekAgo = now.minus(7, java.time.temporal.ChronoUnit.DAYS);
        var monthAgo = now.minus(30, java.time.temporal.ChronoUnit.DAYS);
        var todayCount = messageService.countByCompanyIdAndCreatedAtAfter(companyId, startOfDay);
        var weekCount = messageService.countByCompanyIdAndCreatedAtAfter(companyId, weekAgo);
        var monthCount = messageService.countByCompanyIdAndCreatedAtAfter(companyId, monthAgo);
        return new MessageStatsResponse(
                total, newCount, readCount, repliedCount, archivedCount,
                todayCount, weekCount, monthCount);
    }

    public MessageResponse toResponse(Message m) {
        return new MessageResponse(
                m.getId().toString(),
                m.getFirstName(),
                m.getLastName(),
                m.getEmail(),
                m.getPhone(),
                m.getCompany(),
                m.getSubject(),
                m.getMessage(),
                m.getStatus(),
                m.getPriority(),
                m.getSource(),
                m.getPersonId(),
                m.getCreatedAt(),
                m.getReadAt(),
                m.getRepliedAt()
        );
    }

    private Message toEntity(UUID companyId, CreateMessageRequest req) {
        var m = new Message();
        m.setCompanyId(companyId);
        m.setFirstName(req.firstName().trim());
        m.setLastName(req.lastName().trim());
        m.setEmail(req.email().trim().toLowerCase());
        m.setPhone(trim(req.phone()));
        m.setCompany(trim(req.company()));
        m.setSubject(req.subject().trim());
        m.setMessage(req.message().trim());
        m.setPriority(req.priority() != null ? req.priority() : "medium");
        m.setSource(req.source() != null ? req.source() : "website");
        return m;
    }

    private void applyUpdate(Message m, UpdateMessageRequest req) {
        if (req.status() != null) m.setStatus(req.status());
        if (req.priority() != null) m.setPriority(req.priority());
    }

    private static String trim(String s) {
        return s != null ? s.trim() : null;
    }
}
