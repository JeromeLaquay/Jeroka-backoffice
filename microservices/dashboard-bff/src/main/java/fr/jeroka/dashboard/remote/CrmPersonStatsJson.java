package fr.jeroka.dashboard.remote;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record CrmPersonStatsJson(
        long total, long active, long inactive, long prospect, long createdThisMonth) {}
