package fr.jeroka.audit.kafka;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import fr.jeroka.audit.entity.HistoryLog;
import fr.jeroka.audit.repository.HistoryLogRepository;
import fr.jeroka.contracts.kafka.JerokaKafkaConsumerSupport;
import fr.jeroka.contracts.kafka.JerokaKafkaTopics;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Projette les événements Kafka dans {@code history_logs}.
 *
 * <p>Ce listener ne pilote pas le métier: il sert à la traçabilité transverse.
 * Chaque message reçu est stocké avec:
 * - le topic,
 * - l'eventId (enveloppe),
 * - le correlationId (chaînage de flux),
 * - le payload brut (JSON).
 */
@Component
public class AuditKafkaListeners {

    private static final Logger log = LoggerFactory.getLogger(AuditKafkaListeners.class);
    private static final String GROUP = "jeroka-audit-service";

    private final HistoryLogRepository repository;
    private final ObjectMapper objectMapper;

    public AuditKafkaListeners(HistoryLogRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(
            topics = {
                    JerokaKafkaTopics.EMAIL_SYNC_REQUESTED,
                    JerokaKafkaTopics.EMAIL_SYNC_COMPLETED,
                    JerokaKafkaTopics.EMAIL_CATEGORY_CREATED,
                    JerokaKafkaTopics.EMAIL_CATEGORY_DELETED,
                    JerokaKafkaTopics.EMAIL_SENDER_ASSIGNED,
                    JerokaKafkaTopics.IA_DOCUMENT_REQUESTED,
                    JerokaKafkaTopics.AUTH_USER_CREATED,
                    JerokaKafkaTopics.AUTH_USER_UPDATED
            },
            groupId = GROUP
    )
    @Transactional
    public void onEvent(String payload, @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {
        try {
            JsonNode root = objectMapper.readTree(payload);
            UUID eventId = JerokaKafkaConsumerSupport.readEventId(root);
            String correlationId = JerokaKafkaConsumerSupport.readCorrelationIdFromEnvelopeOrFlat(root);
            // Le stockage brut simplifie l'analyse des incidents et le debugging inter-services.
            repository.save(new HistoryLog(
                    UUID.randomUUID(),
                    topic,
                    eventId,
                    correlationId,
                    payload));
        } catch (Exception e) {
            log.warn("audit: impossible d'enregistrer topic={}", topic, e);
        }
    }
}
