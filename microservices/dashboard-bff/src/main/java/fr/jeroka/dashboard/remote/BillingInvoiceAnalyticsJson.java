package fr.jeroka.dashboard.remote;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@JsonIgnoreProperties(ignoreUnknown = true)
public record BillingInvoiceAnalyticsJson(List<MonthlyRow> monthlyRevenue, Map<String, Long> statusCounts) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record MonthlyRow(String month, BigDecimal total) {}
}
