package fr.jeroka.dashboard.web.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record RecentInvoiceDto(
        UUID id,
        String invoiceNumber,
        UUID personId,
        String clientName,
        String status,
        BigDecimal totalTtc,
        Instant createdAt) {}
