package fr.jeroka.email.worker;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import fr.jeroka.contracts.kafka.JerokaKafkaConsumerSupport;
import fr.jeroka.contracts.kafka.JerokaKafkaTopics;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/**
 * Consommation des topics email (un groupe, plusieurs topics — évite les conflits de rebalance).
 */
@Component
public class EmailDomainEventListeners {

    private static final Logger log = LoggerFactory.getLogger(EmailDomainEventListeners.class);

    private static final String GROUP = "jeroka-email-events-worker";

    private final RestClient http = RestClient.create();
    private final ObjectMapper objectMapper;

    @Value("${jeroka.api.base-url:http://email-service:3003}")
    private String apiBaseUrl;

    @Value("${jeroka.api.internal-key:}")
    private String internalKey;

    public EmailDomainEventListeners(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @KafkaListener(
            topics = {
                    JerokaKafkaTopics.EMAIL_SYNC_REQUESTED,
                    JerokaKafkaTopics.EMAIL_SYNC_COMPLETED,
                    JerokaKafkaTopics.EMAIL_CATEGORY_CREATED,
                    JerokaKafkaTopics.EMAIL_CATEGORY_DELETED,
                    JerokaKafkaTopics.EMAIL_SENDER_ASSIGNED
            },
            groupId = GROUP
    )
    public void onEmailDomainEvent(String payload, @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {
        log.info("email-events-worker topic={} payload={}", topic, payload);
        if (JerokaKafkaTopics.EMAIL_SYNC_REQUESTED.equals(topic)) {
            triggerJobRun(payload);
        }
    }

    private void triggerJobRun(String payload) {
        String jobId = extractCorrelationId(payload);
        if (jobId == null || jobId.isBlank()) {
            log.warn("sync.requested ignoré: correlationId manquant");
            return;
        }
        if (internalKey == null || internalKey.isBlank()) {
            log.warn("sync.requested ignoré: jeroka.api.internal-key manquant");
            return;
        }
        try {
            http.post()
                    .uri(apiBaseUrl + "/api/v1/emails/sync/" + jobId + "/run")
                    .header("X-Internal-Api-Key", internalKey)
                    .retrieve()
                    .toBodilessEntity();
            log.info("job sync déclenché jobId={}", jobId);
        } catch (Exception e) {
            log.warn("déclenchement job sync échoué jobId={}", jobId, e);
        }
    }

    /**
     * Supporte l'enveloppe {@code JerokaKafkaEventEnvelope} (v1) et l'ancien JSON plat.
     */
    private String extractCorrelationId(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        try {
            JsonNode root = objectMapper.readTree(raw);
            return JerokaKafkaConsumerSupport.readCorrelationIdFromEnvelopeOrFlat(root);
        } catch (Exception e) {
            log.warn("payload Kafka email illisible", e);
        }
        return null;
    }
}
