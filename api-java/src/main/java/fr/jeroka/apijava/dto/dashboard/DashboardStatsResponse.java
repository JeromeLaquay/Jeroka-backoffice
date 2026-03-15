package fr.jeroka.apijava.dto.dashboard;

public record DashboardStatsResponse(
        String companyId,
        long totalClients,
        long totalMessages,
        long totalInvoices,
        long totalQuotes,
        long newClientsMonth,
        long newMessagesWeek,
        long newInvoicesMonth,
        long newQuotesMonth
) {}
