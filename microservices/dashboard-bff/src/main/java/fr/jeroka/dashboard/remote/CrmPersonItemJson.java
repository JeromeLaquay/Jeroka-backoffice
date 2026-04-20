package fr.jeroka.dashboard.remote;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.Instant;

@JsonIgnoreProperties(ignoreUnknown = true)
public record CrmPersonItemJson(
        String id,
        String firstName,
        String lastName,
        String email,
        Instant createdAt) {}
