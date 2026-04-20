package fr.jeroka.billing.web.dto.invoice;

import java.math.BigDecimal;

public record MonthlyRevenueRow(String month, BigDecimal total) {}
