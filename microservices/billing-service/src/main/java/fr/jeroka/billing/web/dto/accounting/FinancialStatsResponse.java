package fr.jeroka.billing.web.dto.accounting;

import java.math.BigDecimal;
import java.util.List;

public record FinancialStatsResponse(FinancialStats data) {

    public record FinancialStats(
            BigDecimal totalRevenue,
            BigDecimal totalExpenses,
            BigDecimal netProfit,
            BigDecimal profitMargin,
            BigDecimal vatOwed,
            long outstandingInvoices,
            long overdueInvoices,
            BigDecimal cashFlow,
            List<MonthlyAmount> monthlyRevenue,
            List<MonthlyAmount> monthlyExpenses,
            List<CategoryAmount> categoryBreakdown) {}

    public record MonthlyAmount(String month, BigDecimal amount) {}

    public record CategoryAmount(String category, BigDecimal amount, BigDecimal percentage) {}
}
