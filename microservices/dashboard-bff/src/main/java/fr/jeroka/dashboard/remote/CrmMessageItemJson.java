package fr.jeroka.dashboard.remote;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.Instant;

@JsonIgnoreProperties(ignoreUnknown = true)
public record CrmMessageItemJson(
        String id,
        String firstName,
        String lastName,
        String email,
        String subject,
        String status,
        String source,
        Instant createdAt) {}
