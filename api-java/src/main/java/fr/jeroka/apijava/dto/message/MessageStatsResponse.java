package fr.jeroka.apijava.dto.message;

public record MessageStatsResponse(
        long total,
        long newCount,
        long readCount,
        long repliedCount,
        long archivedCount,
        long todayCount,
        long weekCount,
        long monthCount
) {}
