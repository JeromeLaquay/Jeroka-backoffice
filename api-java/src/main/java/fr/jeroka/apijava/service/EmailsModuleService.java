package fr.jeroka.apijava.service;

import fr.jeroka.apijava.api.google.GoogleMailService;
import fr.jeroka.apijava.api.google.GmailMessageSimple;
import fr.jeroka.apijava.api.google.GoogleOAuthCredentials;
import fr.jeroka.apijava.entity.EmailLabelPreference;
import fr.jeroka.apijava.entity.EmailSender;
import fr.jeroka.apijava.repository.EmailLabelPreferenceRepository;
import fr.jeroka.apijava.repository.EmailSenderRepository;
import fr.jeroka.apijava.security.JwtService;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class EmailsModuleService {

    private final GoogleOAuthSettingsService googleOAuthSettingsService;
    private final GoogleMailService googleMailService;
    private final EmailLabelPreferenceRepository emailLabelPreferenceRepository;
    private final EmailSenderRepository emailSenderRepository;

    public EmailsModuleService(GoogleOAuthSettingsService googleOAuthSettingsService,
                               GoogleMailService googleMailService,
                               EmailLabelPreferenceRepository emailLabelPreferenceRepository,
                               EmailSenderRepository emailSenderRepository) {
        this.googleOAuthSettingsService = googleOAuthSettingsService;
        this.googleMailService = googleMailService;
        this.emailLabelPreferenceRepository = emailLabelPreferenceRepository;
        this.emailSenderRepository = emailSenderRepository;
    }

    public List<EmailCategoryDto> listCategories(JwtService.UserPrincipal principal) {
        var userId = requireUserId(principal);
        var creds = requireGoogleCreds(userId);
        var now = Instant.now().toString();
        return googleMailService.getUserLabels(creds).stream()
                .map(l -> new EmailCategoryDto(
                        l.id(),
                        l.name(),
                        getDownloadAttachmentsPref(userId, l.id()),
                        userId.toString(),
                        now,
                        now
                ))
                .toList();
    }

    public EmailCategoryDto createCategory(JwtService.UserPrincipal principal, CreateCategoryRequest req) {
        var userId = requireUserId(principal);
        var creds = requireGoogleCreds(userId);
        var name = sanitizeLabelName(req.name());
        var id = googleMailService.createLabel(creds, name);
        var now = Instant.now().toString();
        upsertDownloadAttachmentsPref(userId, id, req.downloadAttachments());
        return new EmailCategoryDto(id, name, req.downloadAttachments(), userId.toString(), now, now);
    }

    public EmailCategoryDto updateCategory(JwtService.UserPrincipal principal, String labelId, UpdateCategoryRequest req) {
        var userId = requireUserId(principal);
        var creds = requireGoogleCreds(userId);
        String name = req.name() != null ? sanitizeLabelName(req.name()) : null;
        if (name != null) {
            googleMailService.renameLabel(creds, labelId, name);
        }
        if (req.downloadAttachments() != null) {
            upsertDownloadAttachmentsPref(userId, labelId, req.downloadAttachments());
        }
        return listCategories(principal).stream()
                .filter(c -> c.id().equals(labelId))
                .findFirst()
                .orElseGet(() -> new EmailCategoryDto(labelId, name != null ? name : "Inconnu",
                        getDownloadAttachmentsPref(userId, labelId),
                        userId.toString(), Instant.now().toString(), Instant.now().toString()));
    }

    public void deleteCategory(JwtService.UserPrincipal principal, String labelId) {
        var userId = requireUserId(principal);
        var creds = requireGoogleCreds(userId);
        googleMailService.deleteLabel(creds, labelId);
        emailLabelPreferenceRepository.deleteByUserIdAndLabelId(userId, labelId);
        detachSendersFromLabel(userId, labelId);
    }

    public EmailsPageDto listEmails(JwtService.UserPrincipal principal, EmailsQuery query) {
        requireUserId(principal);
        var pagination = PaginationDto.of(query.page(), query.limit(), 0);
        return new EmailsPageDto(List.of(), pagination);
    }

    public List<EmailSenderDto> listSenders(JwtService.UserPrincipal principal) {
        var userId = requireUserId(principal);
        return emailSenderRepository.findAllByUserIdOrderByUpdatedAtDesc(userId).stream()
                .map(this::toDto)
                .toList();
    }

    public void assignSenderToCategory(JwtService.UserPrincipal principal, String senderId, AssignCategoryRequest req) {
        var userId = requireUserId(principal);
        var id = UUID.fromString(senderId);
        var sender = emailSenderRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Expéditeur introuvable"));
        sender.setLabelId(req.categoryId());
        emailSenderRepository.save(sender);
    }

    public SyncResultDto sync(JwtService.UserPrincipal principal, SyncRequest req) {
        var userId = requireUserId(principal);
        Optional<GoogleOAuthCredentials> creds = googleOAuthSettingsService.getCredentialsForUser(userId);
        if (creds.isEmpty()) {
            return new SyncResultDto(0, 0);
        }
        var since = Instant.now().minusSeconds(7 * 24L * 3600L);
        int max = req != null && req.count() != null ? req.count() : 100;
        var emails = googleMailService.getRecentEmails(creds.get(), since, Math.max(1, max));
        upsertSendersFromEmails(userId, emails);
        return new SyncResultDto(emails.size(), 0);
    }

    private static UUID requireUserId(JwtService.UserPrincipal principal) {
        if (principal == null || principal.id() == null || principal.id().isBlank()) {
            throw new IllegalArgumentException("Non authentifié");
        }
        return UUID.fromString(principal.id());
    }

    private GoogleOAuthCredentials requireGoogleCreds(UUID userId) {
        return googleOAuthSettingsService.getCredentialsForUser(userId)
                .orElseThrow(() -> new IllegalArgumentException("Compte Google non configuré"));
    }

    private static String sanitizeLabelName(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Le nom de la catégorie est requis");
        }
        return name.trim();
    }

    private boolean getDownloadAttachmentsPref(UUID userId, String labelId) {
        return emailLabelPreferenceRepository.findByUserIdAndLabelId(userId, labelId)
                .map(EmailLabelPreference::isDownloadAttachments)
                .orElse(true);
    }

    private void upsertDownloadAttachmentsPref(UUID userId, String labelId, boolean value) {
        var pref = emailLabelPreferenceRepository.findByUserIdAndLabelId(userId, labelId)
                .orElseGet(() -> {
                    var p = new EmailLabelPreference();
                    p.setUserId(userId);
                    p.setLabelId(labelId);
                    return p;
                });
        pref.setDownloadAttachments(value);
        emailLabelPreferenceRepository.save(pref);
    }

    private void upsertSendersFromEmails(UUID userId, List<GmailMessageSimple> emails) {
        for (GmailMessageSimple m : emails) {
            var parsed = parseFrom(m.from());
            if (parsed.email() == null || parsed.email().isBlank()) continue;
            upsertSender(userId, parsed);
        }
    }

    private void upsertSender(UUID userId, ParsedSender parsed) {
        var existing = emailSenderRepository.findByUserIdAndEmail(userId, parsed.email());
        if (existing.isPresent()) {
            var s = existing.get();
            if (parsed.name() != null && !parsed.name().isBlank()) {
                s.setName(parsed.name());
            }
            emailSenderRepository.save(s);
            return;
        }
        var sender = new EmailSender();
        sender.setUserId(userId);
        sender.setEmail(parsed.email());
        sender.setName(parsed.name());
        emailSenderRepository.save(sender);
    }

    private void detachSendersFromLabel(UUID userId, String labelId) {
        var list = emailSenderRepository.findAllByUserIdOrderByUpdatedAtDesc(userId);
        for (EmailSender s : list) {
            if (labelId.equals(s.getLabelId())) {
                s.setLabelId(null);
                emailSenderRepository.save(s);
            }
        }
    }

    private EmailSenderDto toDto(EmailSender s) {
        return new EmailSenderDto(
                s.getId().toString(),
                s.getEmail(),
                s.getName(),
                s.getLabelId(),
                s.getUserId().toString(),
                s.getCreatedAt() != null ? s.getCreatedAt().toString() : Instant.now().toString(),
                s.getUpdatedAt() != null ? s.getUpdatedAt().toString() : Instant.now().toString()
        );
    }

    private static ParsedSender parseFrom(String from) {
        if (from == null) return new ParsedSender(null, null);
        String trimmed = from.trim();
        int lt = trimmed.indexOf('<');
        int gt = trimmed.indexOf('>');
        if (lt >= 0 && gt > lt) {
            String name = trimmed.substring(0, lt).replace("\"", "").trim();
            String email = trimmed.substring(lt + 1, gt).trim();
            return new ParsedSender(email, name.isBlank() ? null : name);
        }
        if (trimmed.contains("@")) {
            return new ParsedSender(trimmed, null);
        }
        return new ParsedSender(null, null);
    }

    // ===== DTO (records) =====

    public record EmailCategoryDto(String id, String name, boolean downloadAttachments,
                                   String userId, String createdAt, String updatedAt) {}

    public record CreateCategoryRequest(String name, boolean downloadAttachments) {}

    public record UpdateCategoryRequest(String name, Boolean downloadAttachments) {}

    public record AssignCategoryRequest(String categoryId) {}

    public record EmailsQuery(int page, int limit, String categoryId, Boolean hasAttachments) {
        public static EmailsQuery of(Integer page, Integer limit, String categoryId, Boolean hasAttachments) {
            return new EmailsQuery(page != null ? page : 1, limit != null ? limit : 20, categoryId, hasAttachments);
        }
    }

    public record PaginationDto(int page, int limit, int total, int totalPages) {
        public static PaginationDto of(int page, int limit, int total) {
            int safeLimit = Math.max(1, limit);
            int pages = (int) Math.ceil(total / (double) safeLimit);
            return new PaginationDto(page, safeLimit, total, Math.max(1, pages));
        }
    }

    public record EmailsPageDto(List<Object> data, PaginationDto pagination) {}

    public record EmailSenderDto(String id, String email, String name, String categoryId,
                                 String userId, String createdAt, String updatedAt) {}

    public record SyncRequest(String mode, Integer count, String dateFrom, String dateTo,
                              Boolean includeAttachments, Boolean autoAnalyze) {}

    public record SyncResultDto(int newEmails, int downloadedAttachments) {}

    private record ParsedSender(String email, String name) {}
}

