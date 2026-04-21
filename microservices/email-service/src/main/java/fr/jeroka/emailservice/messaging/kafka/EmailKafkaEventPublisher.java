package fr.jeroka.emailservice.messaging.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import fr.jeroka.contracts.kafka.EmailSyncCompletedPayload;
import fr.jeroka.contracts.kafka.EmailSyncRequestedPayload;
import fr.jeroka.contracts.kafka.JerokaKafkaEnvelopeBuilder;
import fr.jeroka.contracts.kafka.JerokaKafkaEventEnvelope;
import fr.jeroka.contracts.kafka.JerokaKafkaTopics;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.UUID;

/**
 * Publie les événements du domaine « emails » vers Kafka.
 *
 * <p>Interaction globale:
 * 1) {@code email-service} émet un événement métier (sync demandée, catégorie créée, etc.).
 * 2) {@code email-events-worker} consomme ces événements pour déclencher des traitements asynchrones.
 * 3) {@code audit-service} consomme les mêmes topics pour historiser les actions dans {@code history_logs}.
 *
 * <p>L'enveloppe {@code JerokaKafkaEventEnvelope} uniformise le format (eventId, correlationId, data).
 */
@Component
@ConditionalOnBean(KafkaTemplate.class)
public class EmailKafkaEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(EmailKafkaEventPublisher.class);

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public EmailKafkaEventPublisher(KafkaTemplate<String, String> kafkaTemplate, ObjectMapper objectMapper) {
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
    }

    public void publishSyncRequested(UUID correlationId, UUID userId, String mode, Integer count,
                                     String dateFrom, String dateTo, Boolean includeAttachments, Boolean autoAnalyze) {
        var payload = new EmailSyncRequestedPayload(correlationId, userId, mode, count, dateFrom, dateTo,
                includeAttachments, autoAnalyze, Instant.now());
        send(JerokaKafkaTopics.EMAIL_SYNC_REQUESTED, userId.toString(), payload);
    }

    public void publishSyncCompleted(UUID correlationId, UUID userId, int newEmails,
                                     int downloadedAttachments, int uniqueSenders) {
        var payload = new EmailSyncCompletedPayload(correlationId, userId, newEmails, downloadedAttachments,
                uniqueSenders, Instant.now());
        send(JerokaKafkaTopics.EMAIL_SYNC_COMPLETED, userId.toString(), payload);
    }

    public void publishCategoryCreated(UUID userId, String labelId, String labelName) {
        send(JerokaKafkaTopics.EMAIL_CATEGORY_CREATED, userId.toString(),
                new fr.jeroka.contracts.kafka.EmailCategoryCreatedPayload(userId, labelId, labelName, Instant.now()));
    }

    public void publishCategoryDeleted(UUID userId, String labelId) {
        send(JerokaKafkaTopics.EMAIL_CATEGORY_DELETED, userId.toString(),
                new fr.jeroka.contracts.kafka.EmailCategoryDeletedPayload(userId, labelId, Instant.now()));
    }

    public void publishSenderAssigned(UUID userId, String senderId, String categoryId) {
        send(JerokaKafkaTopics.EMAIL_SENDER_ASSIGNED, userId.toString(),
                new fr.jeroka.contracts.kafka.EmailSenderAssignedPayload(userId, senderId, categoryId, Instant.now()));
    }

    private void send(String topic, String partitionKey, Object dataPayload) {
        try {
            // correlationId = identifiant transversal (job/sync) exploité par les consommateurs.
            JerokaKafkaEventEnvelope envelope = JerokaKafkaEnvelopeBuilder.forTopicPayload(
                    topic,
                    extractCorrelationId(dataPayload),
                    dataPayload);
            String json = objectMapper.writeValueAsString(envelope);
            // partitionKey = userId pour regrouper les événements d'un même utilisateur.
            kafkaTemplate.send(topic, partitionKey, json);
            log.debug("Kafka topic={} clé={}", topic, partitionKey);
        } catch (JsonProcessingException e) {
            log.warn("Sérialisation événement Kafka topic={} ignorée", topic, e);
        }
    }

    private static String extractCorrelationId(Object dataPayload) {
        if (dataPayload instanceof EmailSyncRequestedPayload p && p.correlationId() != null) {
            return p.correlationId().toString();
        }
        if (dataPayload instanceof EmailSyncCompletedPayload p && p.correlationId() != null) {
            return p.correlationId().toString();
        }
        return null;
    }
}
