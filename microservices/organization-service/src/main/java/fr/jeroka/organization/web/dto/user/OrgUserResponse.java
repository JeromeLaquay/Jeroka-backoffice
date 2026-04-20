package fr.jeroka.organization.web.dto.user;

import java.time.Instant;

public record OrgUserResponse(
        String id,
        String email,
        String firstName,
        String lastName,
        String role,
        String companyId,
        boolean active,
        Instant createdAt,
        Instant updatedAt) {}
