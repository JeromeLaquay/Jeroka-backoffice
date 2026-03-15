package fr.jeroka.apijava.service;

/**
 * Agrégat métier pour les statistiques utilisateurs (sortie Service).
 */
public record UserStats(
        long total,
        long active,
        long inactive,
        long admins,
        long users,
        long newThisMonth
) {}
