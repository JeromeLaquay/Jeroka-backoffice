package fr.jeroka.dashboard.web.dto;

import java.util.List;
import java.util.Map;

public record DashboardStatsResponse(
        String companyId,
        long totalClients,
        long totalMessages,
        long totalInvoices,
        long totalQuotes,
        long newClientsMonth,
        long newMessagesWeek,
        long newInvoicesMonth,
        long newQuotesMonth,
        List<RecentClientDto> recentClients,
        List<RecentMessageDto> recentMessages,
        List<RecentInvoiceDto> recentInvoices,
        List<MonthlyRevenueDto> monthlyRevenue,
        Map<String, Long> invoiceStatusCounts) {}
