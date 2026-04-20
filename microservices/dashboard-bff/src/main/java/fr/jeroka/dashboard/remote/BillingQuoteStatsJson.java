package fr.jeroka.dashboard.remote;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record BillingQuoteStatsJson(
        long total,
        long draft,
        long sent,
        long accepted,
        long rejected,
        long expired,
        long createdThisMonth) {}
