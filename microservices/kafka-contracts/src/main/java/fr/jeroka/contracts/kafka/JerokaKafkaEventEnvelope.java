package fr.jeroka.contracts.kafka;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;
import java.util.UUID;

/**
 * Enveloppe commune des événements Kafka (versionnement, idempotence et corrélation).
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record JerokaKafkaEventEnvelope(
        String schemaVersion,
        UUID eventId,
        String eventType,
        String correlationId,
        String causationId,
        Instant emittedAt,
        Object data
) {
    public static final String SCHEMA_V1 = "1.0";

    /**
     * Fabrique une enveloppe v1 avec identifiant unique pour l’idempotence côté consommateur.
     */
    public static JerokaKafkaEventEnvelope v1(String eventType, String correlationId, Object data) {
        return new JerokaKafkaEventEnvelope(
                SCHEMA_V1,
                UUID.randomUUID(),
                eventType,
                correlationId,
                null,
                Instant.now(),
                data);
    }
}
