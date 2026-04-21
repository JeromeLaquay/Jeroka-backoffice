package fr.jeroka.dashboard.remote;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;

@JsonIgnoreProperties(ignoreUnknown = true)
public record BillingInvoiceStatsJson(
        long total,
        long draft,
        long sent,
        long paid,
        long overdue,
        long cancelled,
        BigDecimal totalAmount,
        BigDecimal paidAmount,
        BigDecimal dueAmount,
        long createdThisMonth) {}
