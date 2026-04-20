package fr.jeroka.dashboard.remote;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@JsonIgnoreProperties(ignoreUnknown = true)
public record BillingInvoiceItemJson(
        String id,
        String invoiceNumber,
        UUID personId,
        String status,
        BigDecimal totalTtc,
        Instant createdAt) {}
