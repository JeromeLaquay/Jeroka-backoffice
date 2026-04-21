package fr.jeroka.contracts.kafka;

import java.time.Instant;
import java.util.UUID;

public record EmailSenderAssignedPayload(
        UUID userId,
        String senderId,
        String categoryId,
        Instant occurredAt
) {}
