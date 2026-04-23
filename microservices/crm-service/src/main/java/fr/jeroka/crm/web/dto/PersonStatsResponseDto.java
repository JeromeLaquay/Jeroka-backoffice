package fr.jeroka.crm.web.dto;

/** Statistiques personnes ; {@code createdThisMonth} = créations depuis le 1er du mois (UTC). */
public record PersonStatsResponseDto(
        long total,
        long active,
        long inactive,
        long prospect,
        long createdThisMonth,
        long companies) {}
