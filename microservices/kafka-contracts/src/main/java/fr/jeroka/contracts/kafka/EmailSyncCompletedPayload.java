package fr.jeroka.contracts.kafka;

import java.time.Instant;
import java.util.UUID;

/** Fin de synchronisation Gmail (expéditeurs / catégories). */
public record EmailSyncCompletedPayload(
        UUID correlationId,
        UUID userId,
        int newEmails,
        int downloadedAttachments,
        int uniqueSenders,
        Instant occurredAt
) {}
