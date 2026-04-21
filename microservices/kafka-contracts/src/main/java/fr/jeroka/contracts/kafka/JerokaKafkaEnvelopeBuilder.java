package fr.jeroka.contracts.kafka;

import java.util.UUID;

/**
 * Construit des enveloppes v1 homogènes (évite la duplication dans les publishers).
 */
public final class JerokaKafkaEnvelopeBuilder {

    private JerokaKafkaEnvelopeBuilder() {}

    public static JerokaKafkaEventEnvelope forTopicPayload(
            String topicAsEventType,
            String correlationId,
            Object dataPayload) {
        return JerokaKafkaEventEnvelope.v1(topicAsEventType, correlationId, dataPayload);
    }

    public static JerokaKafkaEventEnvelope withCausation(
            String topicAsEventType,
            String correlationId,
            UUID causationId,
            Object dataPayload) {
        return new JerokaKafkaEventEnvelope(
                JerokaKafkaEventEnvelope.SCHEMA_V1,
                UUID.randomUUID(),
                topicAsEventType,
                correlationId,
                causationId != null ? causationId.toString() : null,
                java.time.Instant.now(),
                dataPayload);
    }
}
