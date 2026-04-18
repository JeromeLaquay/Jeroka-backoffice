package fr.jeroka.apijava.api.google;

import java.time.Instant;
import java.util.List;

/**
 * Contrat pour l'intégration Gmail (OAuth2, list/send, pièces jointes).
 * Implémentation réelle à fournir (ex. via Google API Client).
 */
public interface GoogleMailService {

    /**
     * Charge les messages récents. Chaque {@link GmailMessageSimple} doit inclure
     * {@code labelIds} (API Gmail {@code labelIds}) pour que la synchronisation puisse
     * rattacher les expéditeurs aux catégories (libellés utilisateur).
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
     * @param type {@code user} = libellé personnalisé ; {@code system} = libellé Gmail (non exposé dans l'UI catégories).
     */
    record GmailLabel(String id, String name, String type) {
        public GmailLabel {
            if (type == null || type.isBlank()) {
                type = "user";
            }
        }
    }
}
