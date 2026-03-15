package fr.jeroka.apijava.dto.person;

public record PersonStatsResponse(
        long total,
        long active,
        long inactive,
        long prospect
) {}
