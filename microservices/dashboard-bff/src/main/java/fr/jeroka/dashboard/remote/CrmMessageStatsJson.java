package fr.jeroka.dashboard.remote;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record CrmMessageStatsJson(
        long total,
        long newCount,
        long readCount,
        long repliedCount,
        long archivedCount,
        long todayCount,
        long weekCount,
        long monthCount) {}
