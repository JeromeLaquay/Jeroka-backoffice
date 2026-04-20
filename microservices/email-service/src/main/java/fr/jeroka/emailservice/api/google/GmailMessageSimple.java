package fr.jeroka.emailservice.api.google;

import java.util.List;

public record GmailMessageSimple(
        String id,
        String subject,
        String from,
        String to,
        String cc,
        String bcc,
        String date,
        String snippet,
        String internalDate,
        Long sizeEstimate,
        List<GmailAttachmentSummary> attachments,
        String body,
        String htmlBody,
        String textBody,
        /** Identifiants de libellÃ©s Gmail (user + systÃ¨me) tels que renvoyÃ©s par l'API. */
        List<String> labelIds
) {
    public GmailMessageSimple {
        attachments = attachments == null ? List.of() : List.copyOf(attachments);
        labelIds = labelIds == null ? List.of() : List.copyOf(labelIds);
    }

    public record GmailAttachmentSummary(String filename, String mimeType, Long size, String id) {}
}
