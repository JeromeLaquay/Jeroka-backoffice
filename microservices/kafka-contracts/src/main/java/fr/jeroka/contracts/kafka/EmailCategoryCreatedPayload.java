package fr.jeroka.contracts.kafka;

import java.time.Instant;
import java.util.UUID;

public record EmailCategoryCreatedPayload(UUID userId, String labelId, String labelName, Instant occurredAt) {}
