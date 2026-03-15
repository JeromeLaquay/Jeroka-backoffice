package fr.jeroka.apijava.dto.quote;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record QuoteResponse(
        String id,
        String quoteNumber,
        UUID personId,
        String status,
        String title,
        String description,
        BigDecimal subtotalHt,
        BigDecimal discountPercent,
        BigDecimal discountAmount,
        BigDecimal totalHt,
        BigDecimal totalVat,
        BigDecimal totalTtc,
        LocalDate validUntil,
        String notes,
        String paymentTerms,
        Instant createdAt,
        Instant updatedAt
) {}
