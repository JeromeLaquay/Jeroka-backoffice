package fr.jeroka.dashboard.web.dto;

import java.time.Instant;
import java.util.UUID;

public record RecentClientDto(UUID id, String firstName, String lastName, String email, Instant createdAt) {}
