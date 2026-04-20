package fr.jeroka.crm.web.dto;

public record MessageStatsResponseDto(
        long total,
        long newCount,
        long readCount,
        long repliedCount,
        long archivedCount,
        long todayCount,
        long weekCount,
        long monthCount
) {}
