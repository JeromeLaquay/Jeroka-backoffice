package fr.jeroka.apijava.dto.invoice;

import java.math.BigDecimal;

public record InvoiceStatsResponse(
        long total,
        long draft,
        long sent,
        long paid,
        long overdue,
        long cancelled,
        BigDecimal totalAmount,
        BigDecimal paidAmount,
        BigDecimal dueAmount
) {}
