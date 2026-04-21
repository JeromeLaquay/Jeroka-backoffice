package fr.jeroka.billing.web.dto.invoice;

import java.util.List;
import java.util.Map;

/** Agrégats facturation pour le dashboard (BFF). */
public record InvoiceDashboardAnalyticsResponse(
        List<MonthlyRevenueRow> monthlyRevenue, Map<String, Long> statusCounts) {}
