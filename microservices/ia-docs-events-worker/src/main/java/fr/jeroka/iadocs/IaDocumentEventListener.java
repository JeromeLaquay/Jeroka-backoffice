package fr.jeroka.iadocs;

import fr.jeroka.contracts.kafka.JerokaKafkaTopics;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

/**
 * Consommateur placeholder pour les commandes « document / IA ».
 * Remplacez par le traitement réel (timeouts, stockage objet, appels LLM).
 */
@Component
public class IaDocumentEventListener {

    private static final Logger log = LoggerFactory.getLogger(IaDocumentEventListener.class);

    private static final String GROUP = "jeroka-ia-docs-events-worker";

    @KafkaListener(topics = JerokaKafkaTopics.IA_DOCUMENT_REQUESTED, groupId = GROUP)
    public void onDocumentRequested(String payload, @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {
        log.info("ia-docs-events-worker topic={} payload={}", topic, payload);
    }
}
