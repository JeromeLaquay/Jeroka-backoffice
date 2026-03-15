package fr.jeroka.apijava.api.google;

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
        String textBody
) {
    public record GmailAttachmentSummary(String filename, String mimeType, Long size, String id) {}
}
