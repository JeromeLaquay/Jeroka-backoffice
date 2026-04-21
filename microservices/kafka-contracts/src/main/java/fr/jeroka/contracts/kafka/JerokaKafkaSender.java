package fr.jeroka.contracts.kafka;

/**
 * Abstraction d’envoi (implémentée typiquement par un wrapper autour de {@code KafkaTemplate}).
 */
@FunctionalInterface
public interface JerokaKafkaSender {

    void sendJson(String topic, String partitionKey, String jsonPayload);
}
