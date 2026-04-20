package fr.jeroka.emailservice.api.google;

import java.time.Instant;
import java.util.List;

/**
 * Contrat pour l'intÃ©gration Gmail (OAuth2, list/send, piÃ¨ces jointes).
 * ImplÃ©mentation rÃ©elle Ã  fournir (ex. via Google API Client).
 */
public interface GoogleMailService {

    /**
     * Charge les messages rÃ©cents. Chaque {@link GmailMessageSimple} doit inclure
     * {@code labelIds} (API Gmail {@code labelIds}) pour que la synchronisation puisse
     * rattacher les expÃ©diteurs aux catÃ©gories (libellÃ©s utilisateur).
     */
    List<GmailMessageSimple> getRecentEmails(GoogleOAuthCredentials credentials,
                                             Instant since, int maxResults);

    byte[] getAttachmentData(GoogleOAuthCredentials credentials,
                             String messageId, String attachmentId);

    List<GmailLabel> getUserLabels(GoogleOAuthCredentials credentials);

    String createLabel(GoogleOAuthCredentials credentials, String labelName);

    void renameLabel(GoogleOAuthCredentials credentials, String labelId, String newLabelName);

    void deleteLabel(GoogleOAuthCredentials credentials, String labelId);

    /**
     * @param type {@code user} = libellÃ© personnalisÃ© ; {@code system} = libellÃ© Gmail (non exposÃ© dans l'UI catÃ©gories).
     */
    record GmailLabel(String id, String name, String type) {
        public GmailLabel {
            if (type == null || type.isBlank()) {
                type = "user";
            }
        }
    }
}
