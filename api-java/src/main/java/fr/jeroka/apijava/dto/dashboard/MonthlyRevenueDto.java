package fr.jeroka.apijava.dto.dashboard;

import java.math.BigDecimal;

public record MonthlyRevenueDto(
        String month,
        BigDecimal total
) {}
