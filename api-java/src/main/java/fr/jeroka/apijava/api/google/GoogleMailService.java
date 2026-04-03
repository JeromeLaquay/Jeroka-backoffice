package fr.jeroka.apijava.api.google;

import java.time.Instant;
import java.util.List;

/**
 * Contrat pour l'intégration Gmail (OAuth2, list/send, pièces jointes).
 * Implémentation réelle à fournir (ex. via Google API Client).
 */
public interface GoogleMailService {

    List<GmailMessageSimple> getRecentEmails(GoogleOAuthCredentials credentials,
                                             Instant since, int maxResults);

    byte[] getAttachmentData(GoogleOAuthCredentials credentials,
                             String messageId, String attachmentId);

    List<GmailLabel> getUserLabels(GoogleOAuthCredentials credentials);

    String createLabel(GoogleOAuthCredentials credentials, String labelName);

    void renameLabel(GoogleOAuthCredentials credentials, String labelId, String newLabelName);

    void deleteLabel(GoogleOAuthCredentials credentials, String labelId);

    record GmailLabel(String id, String name) {}
}
