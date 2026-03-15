package fr.jeroka.apijava.dto.user;

import java.time.Instant;

public record UserResponse(
        String id,
        String email,
        String firstName,
        String lastName,
        String role,
        String companyId,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {}
