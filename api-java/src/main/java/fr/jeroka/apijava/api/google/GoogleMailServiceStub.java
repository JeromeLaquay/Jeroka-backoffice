package fr.jeroka.apijava.api.google;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Implémentation in-memory (stub). Activer avec {@code app.google.mail.stub=true}.
 */
@Service
@ConditionalOnProperty(name = "app.google.mail.stub", havingValue = "true", matchIfMissing = false)
public class GoogleMailServiceStub implements GoogleMailService {

    private static final Map<String, List<GmailMessageSimple>> EMAILS_BY_KEY = new ConcurrentHashMap<>();
    private static final Map<String, List<GoogleMailService.GmailLabel>> LABELS_BY_KEY = new ConcurrentHashMap<>();

    @Override
    public List<GmailMessageSimple> getRecentEmails(GoogleOAuthCredentials credentials,
                                                    Instant since, int maxResults) {
        String key = storageKey(credentials);
        List<GmailMessageSimple> all = EMAILS_BY_KEY.getOrDefault(key, List.of());
        List<GmailMessageSimple> out = new ArrayList<>();
        int count = 0;
        for (GmailMessageSimple m : all) {
            if (count >= maxResults) break;
            if (m.internalDate() != null && Instant.parse(m.internalDate()).isAfter(since)) {
                out.add(m);
                count++;
            }
        }
        return out;
    }

    @Override
    public byte[] getAttachmentData(GoogleOAuthCredentials credentials,
                                    String messageId, String attachmentId) {
        return new byte[0];
    }

    @Override
    public List<GoogleMailService.GmailLabel> getUserLabels(GoogleOAuthCredentials credentials) {
        return LABELS_BY_KEY.getOrDefault(storageKey(credentials), List.of());
    }

    @Override
    public String createLabel(GoogleOAuthCredentials credentials, String labelName) {
        String id = "label-" + Math.abs(labelName.hashCode());
        String key = storageKey(credentials);
        LABELS_BY_KEY.compute(key, (String k, List<GoogleMailService.GmailLabel> existing) -> {
            List<GoogleMailService.GmailLabel> list = existing != null ? new ArrayList<>(existing) : new ArrayList<>();
            boolean already = list.stream().anyMatch(l -> l.name().equalsIgnoreCase(labelName));
            if (!already) {
                list.add(new GoogleMailService.GmailLabel(id, labelName, "user"));
            }
            return List.copyOf(list);
        });
        return id;
    }

    @Override
    public void renameLabel(GoogleOAuthCredentials credentials, String labelId, String newLabelName) {
        String key = storageKey(credentials);
        LABELS_BY_KEY.computeIfPresent(key, (k, existing) -> {
            List<GoogleMailService.GmailLabel> updated = existing.stream()
                    .map(l -> l.id().equals(labelId) ? new GoogleMailService.GmailLabel(labelId, newLabelName, "user") : l)
                    .toList();
            return List.copyOf(updated);
        });
    }

    @Override
    public void deleteLabel(GoogleOAuthCredentials credentials, String labelId) {
        String key = storageKey(credentials);
        LABELS_BY_KEY.computeIfPresent(key, (k, existing) -> {
            List<GoogleMailService.GmailLabel> updated = existing.stream()
                    .filter(l -> !l.id().equals(labelId))
                    .toList();
            return List.copyOf(updated);
        });
    }

    private static String storageKey(GoogleOAuthCredentials c) {
        return (c != null && c.clientId() != null) ? c.clientId() : "default";
    }
}
