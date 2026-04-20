package fr.jeroka.contracts.kafka;

import java.time.Instant;
import java.util.UUID;

/** Demande de synchronisation Gmail. */
public record EmailSyncRequestedPayload(
        UUID correlationId,
        UUID userId,
        String mode,
        Integer count,
        String dateFrom,
        String dateTo,
        Boolean includeAttachments,
        Boolean autoAnalyze,
        Instant requestedAt
) {}
