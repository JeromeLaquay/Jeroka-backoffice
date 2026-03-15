package fr.jeroka.apijava.dto.product;

public record ProductStatsResponse(
        long total,
        long active
) {}
