package fr.jeroka.apijava.service;

import fr.jeroka.apijava.dto.dashboard.MonthlyRevenueDto;
import fr.jeroka.apijava.entity.Invoice;
import fr.jeroka.apijava.entity.Message;
import fr.jeroka.apijava.entity.Person;

import java.util.List;
import java.util.Map;

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
        long newQuotesMonth,
        List<Person> recentClients,
        List<Message> recentMessages,
        List<Invoice> recentInvoices,
        List<MonthlyRevenueDto> monthlyRevenue,
        Map<String, Long> invoiceStatusCounts
) {}
