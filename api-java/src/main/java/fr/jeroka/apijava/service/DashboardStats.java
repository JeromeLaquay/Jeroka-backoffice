package fr.jeroka.apijava.service;

/**
 * Agrégat métier pour le dashboard (sortie Service).
 */
public record DashboardStats(
        long totalClients,
        long totalMessages,
        long totalInvoices,
        long totalQuotes,
        long newClientsMonth,
        long newMessagesWeek,
        long newInvoicesMonth,
        long newQuotesMonth
) {}
