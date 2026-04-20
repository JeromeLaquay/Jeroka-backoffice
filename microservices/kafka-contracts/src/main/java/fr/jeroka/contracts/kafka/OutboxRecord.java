package fr.jeroka.contracts.kafka;

import java.time.Instant;
import java.util.UUID;

/**
 * Ligne outbox avant envoi Kafka fiable.
 */
public record OutboxRecord(
        UUID id,
        String topic,
        String partitionKey,
        String jsonPayload,
        Instant createdAt
) {}
