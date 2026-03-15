package fr.jeroka.apijava.dto.user;

public record UserStatsResponse(
        long total,
        long active,
        long inactive,
        long admins,
        long users,
        long newThisMonth
) {}
