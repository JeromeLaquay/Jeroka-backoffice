package fr.jeroka.audit.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "history_logs")
public class HistoryLog {

    @Id
    private UUID id;

    @Column(nullable = false)
    private String topic;

    private UUID eventId;

    private String correlationId;

    @Column(columnDefinition = "text")
    private String payload;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    public HistoryLog() {
    }

    public HistoryLog(UUID id, String topic, UUID eventId, String correlationId, String payload) {
        this.id = id;
        this.topic = topic;
        this.eventId = eventId;
        this.correlationId = correlationId;
        this.payload = payload;
    }

    public UUID getId() {
        return id;
    }

    public String getTopic() {
        return topic;
    }

    public UUID getEventId() {
        return eventId;
    }

    public String getCorrelationId() {
        return correlationId;
    }

    public String getPayload() {
        return payload;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
