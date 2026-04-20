package fr.jeroka.contracts.kafka;

/**
 * Noms d’en-têtes Kafka recommandés (propagation corrélation / schéma).
 */
public final class JerokaKafkaHeaders {

    public static final String EVENT_ID = "jeroka-event-id";
    public static final String EVENT_TYPE = "jeroka-event-type";
    public static final String SCHEMA_VERSION = "jeroka-schema-version";
    public static final String CORRELATION_ID = "jeroka-correlation-id";
    public static final String CAUSATION_ID = "jeroka-causation-id";

    private JerokaKafkaHeaders() {}
}
