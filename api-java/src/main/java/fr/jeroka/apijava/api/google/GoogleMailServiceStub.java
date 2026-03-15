package fr.jeroka.apijava.api.google;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Implémentation in-memory (stub). Bean créé par ApiStubsConfig.
 */
public class GoogleMailServiceStub implements GoogleMailService {

    private static final Map<String, List<GmailMessageSimple>> EMAILS_BY_KEY = new ConcurrentHashMap<>();

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
    public List<GmailLabel> getUserLabels(GoogleOAuthCredentials credentials) {
        return List.of();
    }

    @Override
    public String createLabel(GoogleOAuthCredentials credentials, String labelName) {
        return "label-" + labelName.hashCode();
    }

    private static String storageKey(GoogleOAuthCredentials c) {
        return (c != null && c.clientId() != null) ? c.clientId() : "default";
    }
}
