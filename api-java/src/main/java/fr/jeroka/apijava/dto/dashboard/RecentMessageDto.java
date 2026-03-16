package fr.jeroka.apijava.dto.dashboard;

import java.time.Instant;
import java.util.UUID;

public record RecentMessageDto(
        UUID id,
        String firstName,
        String lastName,
        String email,
        String subject,
        String status,
        String source,
        Instant createdAt
) {}
