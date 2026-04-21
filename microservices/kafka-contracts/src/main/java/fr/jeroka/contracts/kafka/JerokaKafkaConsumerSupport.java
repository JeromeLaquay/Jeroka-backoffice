package fr.jeroka.contracts.kafka;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.UUID;

/**
 * Lecture défensive des messages (enveloppe v1 ou JSON plat historique).
 */
public final class JerokaKafkaConsumerSupport {

    private JerokaKafkaConsumerSupport() {}

    public static UUID readEventId(JsonNode root) {
        if (root == null || !root.has("eventId") || root.get("eventId").isNull()) {
            return null;
        }
        try {
            return UUID.fromString(root.get("eventId").asText());
        } catch (Exception e) {
            return null;
        }
    }

    public static String readCorrelationIdFromEnvelopeOrFlat(JsonNode root) {
        if (root == null) {
            return null;
        }
        if (root.has("schemaVersion") && root.has("data")) {
            JsonNode data = root.get("data");
            if (data != null && data.has("correlationId") && !data.get("correlationId").isNull()) {
                return data.get("correlationId").asText(null);
            }
        }
        if (root.has("correlationId") && !root.get("correlationId").isNull()) {
            return root.get("correlationId").asText(null);
        }
        return null;
    }
}
