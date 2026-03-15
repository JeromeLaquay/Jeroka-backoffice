package fr.jeroka.apijava.dto.quote;

public record QuoteStatsResponse(
        long total,
        long draft,
        long sent,
        long accepted,
        long rejected,
        long expired
) {}
