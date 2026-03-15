package fr.jeroka.apijava.dto.message;

import java.time.Instant;
import java.util.UUID;

public record MessageResponse(
        String id,
        String firstName,
        String lastName,
        String email,
        String phone,
        String company,
        String subject,
        String message,
        String status,
        String priority,
        String source,
        UUID personId,
        Instant createdAt,
        Instant readAt,
        Instant repliedAt
) {}
