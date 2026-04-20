package fr.jeroka.contracts.kafka;

import java.time.Instant;
import java.util.UUID;

public record EmailCategoryDeletedPayload(UUID userId, String labelId, Instant occurredAt) {}
